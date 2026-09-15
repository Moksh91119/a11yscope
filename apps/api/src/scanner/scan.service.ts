import { createBrowserContext } from "./browser/browser.service.js";
import { runAccessibilityAudit } from "./accessibility/axe.service.js";
import { validateScanUrl } from "./security/url-security.js";
import { calculateScore } from "./scoring/score.service.js";

export async function scanUrl(url: string) {
  const validatedUrl = await validateScanUrl(url);

  const context = await createBrowserContext();
  const page = await context.newPage();

  try {
    await page.goto(validatedUrl.toString(), {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    const results = await runAccessibilityAudit(page);

    const score = calculateScore(results.violations);

    return {
      url: validatedUrl.toString(),
      title: await page.title(),
      score,
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
    };
  } finally {
    await context.close();
  }
}
