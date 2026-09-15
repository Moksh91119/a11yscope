import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "playwright";

export async function runAccessibilityAudit(page: Page) {
  const results = await new AxeBuilder({
    page,
  }).analyze();

  return results;
}
