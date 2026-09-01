import { expect, test, type Page } from "@playwright/test";

async function runManualDemo(page: Page) {
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
  await expect(page.getByText("54.6", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("30.0", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "05 Clean room" }).click();
  await expect(page.getByText("State COMPARED", { exact: true })).toBeVisible();
  await expect(page.getByText("KinoForge rises from #4 to #1", { exact: true })).toBeVisible();

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
