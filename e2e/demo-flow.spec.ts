import { expect, test, type Page } from "@playwright/test";

async function runManualDemo(page: Page) {
  await expect(page.getByText("Awaiting user intent", { exact: true })).toBeVisible();
  const trace = page.getByRole("list", { name: "Four-step influence trace" });
  await expect(trace.locator(":scope > li")).toHaveCount(4);
  await expect(trace.getByText("Awaiting market ranking.", { exact: true })).toBeVisible();
  await expect(trace.getByText("Inspect the commercial winner to disclose the paid contribution.", { exact: true })).toBeVisible();
  await expect(trace.getByText("Awaiting user policy update.", { exact: true })).toBeVisible();
  await expect(trace.getByText("Compare the market with the clean room.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "01 Create intent" }).click();
  await expect(page.getByText("State INTENT_READY", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "02 Run auction" }).click();
  await expect(page.getByText("State AUCTION_COMPLETE", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "03 Rank market" }).click();
  await expect(page.getByText("State MARKET_RANKED", { exact: true })).toBeVisible();
  await expect(page.getByText("84.6", { exact: true }).first()).toBeVisible();
  await expect(trace.getByText("OmniMotion Ultra", { exact: true })).toBeVisible();
  await expect(trace.getByText("Awaiting user policy update.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "04 Inspect receipt" }).click();
  await expect(page.getByText("State AUDITED", { exact: true })).toBeVisible();
  await expect(page.getByText("54.6", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("30.0", { exact: true }).first()).toBeVisible();
  await expect(trace.getByText("+30.0", { exact: true })).toBeVisible();
  await expect(trace.getByText("SIMULATED CPA $24.00", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "05 Clean room" }).click();
  await expect(page.getByText("State COMPARED", { exact: true })).toBeVisible();
  await expect(page.getByText("KinoForge rises from #4 to #1", { exact: true })).toBeVisible();
  await expect(trace.getByText("SPONSORSHIP BLOCKED", { exact: true })).toBeVisible();
  await expect(trace.getByText("MAXIMUM SPONSOR WEIGHT · 0%", { exact: true })).toBeVisible();
  await expect(trace.getByText("KinoForge Studio", { exact: true })).toBeVisible();
  await expect(trace.getByText("CLEAN ROOM #1 · SCORE 92.0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "06 Stage KinoForge" }).click();
  await expect(page.getByRole("dialog", { name: "Stage KinoForge Studio?" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm selection" }).click();
  await expect(page.getByText("State SELECTION_STAGED", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Confirmed for demonstration only. No purchase occurred.", {
      exact: true,
    }),
  ).toBeVisible();
}

test("manual fallback completes deterministically twice without horizontal overflow", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect(page.getByText("WebMCP unavailable", { exact: true })).toBeVisible();
  await runManualDemo(page);

  await page.reload();
  await runManualDemo(page);

  const horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(horizontalOverflow).toBe(false);
  expect(consoleErrors).toEqual([]);
});

test("canonical $80 budget remains visible through receipt and staged selection", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "01 Create intent" }).click();
  await page.getByRole("button", { name: "02 Run auction" }).click();
  await page.getByRole("button", { name: "03 Rank market" }).click();
  await page.getByRole("button", { name: "04 Inspect receipt" }).click();

  const intentManifest = page.locator(".intent-panel .manifest-list");
  await expect(page.getByText("State AUDITED", { exact: true })).toBeVisible();
  await expect(intentManifest.getByText("$80.00 / month", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "05 Clean room" }).click();
  await page.getByRole("button", { name: "06 Stage KinoForge" }).click();
  await page.getByRole("button", { name: "Confirm selection" }).click();

  await expect(page.getByText("State SELECTION_STAGED", { exact: true })).toBeVisible();
  await expect(intentManifest.getByText("$80.00 / month", { exact: true })).toBeVisible();
});

test("influence trace never pairs the market winner with a nonwinner receipt", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "01 Create intent" }).click();
  await page.getByRole("button", { name: "02 Run auction" }).click();
  await page.getByRole("button", { name: "03 Rank market" }).click();

  const trace = page.getByRole("list", { name: "Four-step influence trace" });
  const nonwinner = page.locator(".offer-row").filter({ hasText: "PromptCloud Infinite" }).first();
  await nonwinner.getByRole("button", { name: "Audit" }).click();

  await expect(page.getByText("State AUDITED", { exact: true })).toBeVisible();
  await expect(trace.getByText("OmniMotion Ultra", { exact: true })).toBeVisible();
  await expect(
    trace.getByText("Inspect the commercial winner to disclose the paid contribution.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(trace.getByText("+18.8", { exact: true })).toHaveCount(0);
  await expect(page.locator(".receipt-panel").getByText("PromptCloud Infinite", { exact: true })).toBeVisible();
});

test("agent test prompts remain readable without horizontal overflow", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1100, height: 900 },
    { width: 760, height: 900 },
    { width: 360, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const prompts = page.locator("details.agent-prompts");
    const summary = prompts.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");

    await expect(prompts).toHaveAttribute("open", "");
    await expect(page.getByRole("link", { name: "Devpost entry" })).toHaveAttribute(
      "href",
      "https://devpost.com/software/intent-for-sale",
    );
    await expect(page.getByRole("heading", { name: "Get a recommendation" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Audit the influence" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Verify native WebMCP" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Test the confirmation boundary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy prompt" })).toHaveCount(4);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
  }
});
