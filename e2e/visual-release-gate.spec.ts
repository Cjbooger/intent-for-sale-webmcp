import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "desktop-reference", width: 1440, height: 900 },
  { name: "video-baseline", width: 1280, height: 720 },
  { name: "desktop-breakpoint", width: 1100, height: 800 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "mobile-breakpoint", width: 760, height: 1024 },
  { name: "narrow-phone", width: 360, height: 800 },
] as const;

async function runToCompared(page: Page) {
  await expect(page.getByText("Awaiting user intent", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "01 Create intent" }).click();
  await expect(page.getByText("State INTENT_READY", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "02 Run auction" }).click();
  await expect(page.getByText("State AUCTION_COMPLETE", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "03 Rank market" }).click();
  await expect(page.getByText("State MARKET_RANKED", { exact: true })).toBeVisible();
  await expect(page.getByText("84.6", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "04 Inspect receipt" }).click();
  await expect(page.getByText("State AUDITED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "05 Clean room" }).click();
  await expect(page.getByText("State COMPARED", { exact: true })).toBeVisible();
  await expect(page.getByText("KinoForge rises from #4 to #1", { exact: true })).toBeVisible();
}

async function readOverflowMetrics(page: Page) {
  const metrics = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>("*"))
      .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right, left: element.getBoundingClientRect().left, width: element.getBoundingClientRect().width, text: (element.textContent ?? "").trim().slice(0, 100) }))
      .filter((element) => element.right > window.innerWidth + 1)
      .sort((left, right) => right.right - left.right)
      .slice(0, 5);
    return { ok: document.documentElement.scrollWidth <= window.innerWidth, scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, candidates };
  });
  return metrics.ok ? null : JSON.stringify(metrics);
}

async function assertFocusInsideDialog(page: Page) {
  expect(await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    return Boolean(dialog && dialog.contains(document.activeElement));
  })).toBe(true);
}

async function readWebMcpStatusMetrics(page: Page) {
  return page.locator(".webmcp-status").evaluate((status) => {
    const copy = status.querySelector<HTMLElement>(".status-copy");
    const detail = status.querySelector<HTMLElement>("small");
    const label = status.querySelector<HTMLElement>("strong");
    const statusRect = status.getBoundingClientRect();
    const boxes = [statusRect, copy?.getBoundingClientRect(), detail?.getBoundingClientRect(), label?.getBoundingClientRect()].filter(Boolean);
    return {
      statusOverflow: status.scrollWidth > status.clientWidth,
      copyOverflow: Boolean(copy && copy.scrollWidth > copy.clientWidth),
      detailOverflow: Boolean(detail && detail.scrollWidth > detail.clientWidth),
      viewportOverflow: boxes.some((box) => box!.right > window.innerWidth + 1),
    };
  });
}

async function readManualFallbackAccessibility(page: Page) {
  return page.evaluate(() => {
    const flowBar = document.querySelector<HTMLElement>(".flow-bar");
    const dashboard = document.querySelector<HTMLElement>(".dashboard");
    const receipt = document.querySelector<HTMLElement>(".receipt-panel");
    const receiptSummary = document.querySelector<HTMLElement>(".receipt-summary");
    const criticalSelectors = [
      ".webmcp-status small",
      ".trace-meta",
      ".trace-detail",
      ".flow-label span",
      ".flow-label small",
      ".flow-bar button",
    ];
    const criticalText = criticalSelectors
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .filter((element): element is HTMLElement => Boolean(element))
      .map((element) => ({
        selector: element.className,
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
        height: element.getBoundingClientRect().height,
      }));
    const flowRect = flowBar?.getBoundingClientRect();
    const receiptRect = receipt?.getBoundingClientRect();
    const summaryStyle = receiptSummary ? getComputedStyle(receiptSummary) : null;
    const summaryRect = receiptSummary?.getBoundingClientRect();

    return {
      buttons: flowBar?.querySelectorAll("button").length ?? 0,
      flowPosition: flowBar ? getComputedStyle(flowBar).position : null,
      dashboardDirection: dashboard ? getComputedStyle(dashboard).flexDirection : null,
      flowBelowReceipt: Boolean(flowRect && receiptRect && flowRect.top >= receiptRect.bottom - 1),
      summaryVisible: Boolean(
        summaryStyle
          && summaryStyle.display !== "none"
          && summaryStyle.visibility !== "hidden"
          && summaryRect
          && summaryRect.width > 0
          && summaryRect.height > 0,
      ),
      criticalText,
    };
  });
}

for (const viewport of viewports) {
  test(`${viewport.name} keeps the manual flow and modal accessible`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const overflowSnapshots: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
      if (message.type() === "warning") consoleWarnings.push(message.text());
    });

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const webmcpStatus = page.locator(".webmcp-status");
    await expect(webmcpStatus.getByText("WebMCP unavailable", { exact: true })).toBeVisible();
    if (viewport.width <= 760) {
      await expect(webmcpStatus.locator("small")).toBeVisible();
      await expect(webmcpStatus.locator("small b")).toHaveText("MODEL CONTEXT");
      await expect(webmcpStatus.locator("small")).toContainText("manual fallback enabled");
      expect(await readWebMcpStatusMetrics(page)).toEqual({ statusOverflow: false, copyOverflow: false, detailOverflow: false, viewportOverflow: false });
    }
    await expect(page.getByText("FICTIONAL SIMULATION", { exact: true })).toBeVisible();
    const initialOverflow = await readOverflowMetrics(page);
    if (initialOverflow) overflowSnapshots.push(`initial: ${initialOverflow}`);

    const motion = await page.evaluate(() => ({
      pressureTransition: getComputedStyle(document.querySelector(".pressure-track i")!).transitionDuration,
      pressureAnimation: getComputedStyle(document.querySelector(".pressure-track i")!).animationName,
      copyTransition: getComputedStyle(document.querySelector(".icon-button")!).transitionDuration,
    }));
    expect(motion).toEqual({ pressureTransition: "0s", pressureAnimation: "none", copyTransition: "0s" });

    await runToCompared(page);
    const fallbackAccessibility = await readManualFallbackAccessibility(page);
    expect(fallbackAccessibility.buttons).toBe(6);
    expect(fallbackAccessibility.flowPosition).not.toBe("fixed");
    expect(fallbackAccessibility.flowBelowReceipt).toBe(true);
    if (viewport.width <= 760) {
      expect(fallbackAccessibility.dashboardDirection).toBe("column");
    }
    if (viewport.width >= 1100) {
      expect(fallbackAccessibility.summaryVisible).toBe(true);
    }
    expect(
      fallbackAccessibility.criticalText.every(({ fontSize, height }) => fontSize >= 11 && height >= 11),
      JSON.stringify(fallbackAccessibility),
    ).toBe(true);
    const waterfallHeaderMetrics = await page.locator(".waterfall-head span").evaluateAll((headers) => (
      headers.map((header) => {
        const element = header as HTMLElement;
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, clipped: element.scrollWidth > element.clientWidth + 1 };
      })
    ));
    expect(waterfallHeaderMetrics).toHaveLength(4);
    expect(waterfallHeaderMetrics.every(({ clipped }) => !clipped), JSON.stringify(waterfallHeaderMetrics)).toBe(true);
    expect(
      waterfallHeaderMetrics.slice(1).every(({ left }, index) => left >= waterfallHeaderMetrics[index].right - 1),
      JSON.stringify(waterfallHeaderMetrics),
    ).toBe(true);

    const comparedOverflow = await readOverflowMetrics(page);
    if (comparedOverflow) overflowSnapshots.push(`compared: ${comparedOverflow}`);

    const stageButton = page.getByRole("button", { name: "06 Stage KinoForge" });
    await stageButton.click();
    const dialog = page.getByRole("dialog", { name: "Stage KinoForge Studio?" });
    const cancelButton = dialog.getByRole("button", { name: "Cancel" });
    const confirmButton = dialog.getByRole("button", { name: "Confirm selection" });
    await expect(dialog).toBeVisible();
    await expect(confirmButton).toBeFocused();
    await assertFocusInsideDialog(page);
    await expect(page.getByRole("note").getByText("NO PURCHASE", { exact: true })).toBeVisible();
    await expect(dialog.getByText("It cannot subscribe, purchase, or contact anyone.", { exact: false })).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(cancelButton).toBeFocused();
    await assertFocusInsideDialog(page);
    await page.keyboard.press("Shift+Tab");
    await expect(confirmButton).toBeFocused();
    await assertFocusInsideDialog(page);
    const dialogOverflow = await readOverflowMetrics(page);
    if (dialogOverflow) overflowSnapshots.push(`dialog: ${dialogOverflow}`);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(stageButton).toBeFocused();

    await stageButton.click();
    await expect(confirmButton).toBeFocused();
    await cancelButton.click();
    await expect(dialog).toBeHidden();
    await expect(stageButton).toBeFocused();

    await stageButton.click();
    await confirmButton.click();
    await expect(page.getByText("State SELECTION_STAGED", { exact: true })).toBeVisible();
    await expect(page.getByText("Confirmed for demonstration only. No purchase occurred.", { exact: true })).toBeVisible();
    const stagedOverflow = await readOverflowMetrics(page);
    if (stagedOverflow) overflowSnapshots.push(`staged: ${stagedOverflow}`);
    expect(overflowSnapshots, overflowSnapshots.join("\n")).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(consoleWarnings).toEqual([]);
  });
}

test("200% zoom-equivalent viewport reflows and keeps fallback controls keyboard reachable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await runToCompared(page);

  const copySessionButton = page.getByRole("button", { name: "Copy session ID" });
  const stageButton = page.getByRole("button", { name: "06 Stage KinoForge" });
  await copySessionButton.click();
  await expect(copySessionButton).toBeFocused();

  // At 200% browser zoom, a 1440x900 display exposes a 720x450 CSS viewport.
  // Resizing to those CSS dimensions exercises the same responsive reflow without
  // relying on Chromium's nonstandard CSS zoom property.
  await page.setViewportSize({ width: 720, height: 450 });
  expect(await readOverflowMetrics(page)).toBeNull();

  let reachedStageWithKeyboard = false;
  for (let tab = 0; tab < 60; tab += 1) {
    await page.keyboard.press("Tab");
    if (await stageButton.evaluate((button) => button === document.activeElement)) {
      reachedStageWithKeyboard = true;
      break;
    }
  }
  expect(reachedStageWithKeyboard).toBe(true);
  await expect(stageButton).toBeFocused();

  const zoomEquivalentMetrics = await page.evaluate(() => {
    const flowBar = document.querySelector<HTMLElement>(".flow-bar");
    const flowButtons = Array.from(flowBar?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const receiptSummary = document.querySelector<HTMLElement>(".receipt-summary");
    const active = document.activeElement as HTMLElement | null;
    const activeRect = active?.getBoundingClientRect();
    const criticalSelectors = [".webmcp-status small", ".trace-meta", ".trace-detail", ".flow-label span", ".flow-label small", ".flow-bar button"];
    const criticalElements = criticalSelectors.flatMap((selector) => (
      Array.from(document.querySelectorAll<HTMLElement>(selector))
    ));

    return {
      dashboardDirection: getComputedStyle(document.querySelector<HTMLElement>(".dashboard")!).flexDirection,
      buttonCount: flowButtons.length,
      controlsUnclipped: flowButtons.every((button) => (
        button.getBoundingClientRect().width > 0
        && button.getBoundingClientRect().height >= 36
        && button.scrollWidth <= button.clientWidth + 1
        && button.scrollHeight <= button.clientHeight + 1
      )),
      criticalTextReadable: criticalElements.every((element) => (
        Number.parseFloat(getComputedStyle(element).fontSize) >= 11
        && element.getBoundingClientRect().width > 0
        && element.getBoundingClientRect().height >= 11
      )),
      receiptReachable: Boolean(
        receiptSummary
        && receiptSummary.getBoundingClientRect().width > 0
        && receiptSummary.getBoundingClientRect().height > 0,
      ),
      focusedControlVisible: Boolean(
        activeRect
        && activeRect.left >= 0
        && activeRect.right <= window.innerWidth
        && activeRect.top >= 0
        && activeRect.bottom <= window.innerHeight,
      ),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(zoomEquivalentMetrics).toEqual({
    dashboardDirection: "column",
    buttonCount: 6,
    controlsUnclipped: true,
    criticalTextReadable: true,
    receiptReachable: true,
    focusedControlVisible: true,
    horizontalOverflow: false,
  });
});
