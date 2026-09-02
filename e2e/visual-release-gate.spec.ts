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
