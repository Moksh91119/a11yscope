import { createBrowserContext } from "./browser/browser.service.js";
import { runAccessibilityAudit } from "./accessibility/axe.service.js";
import { crawlWebsite } from "./crawler/crawler.service.js";
import { validateScanUrl } from "./security/url-security.js";
import { calculateScore } from "./scoring/score.service.js";

export async function scanWebsite(url: string, maxPages = 10) {
  const validatedUrl = await validateScanUrl(url);

  const context = await createBrowserContext();

  try {
    const urls = await crawlWebsite(context, validatedUrl.toString(), maxPages);

    const pages = [];

    for (const pageUrl of urls) {
      const page = await context.newPage();

      try {
        await page.goto(pageUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });

        const results = await runAccessibilityAudit(page);

        pages.push({
          url: pageUrl,
          title: await page.title(),
          results,
        });
      } catch (error) {
        console.warn(
          `Failed to scan ${pageUrl}:`,
          error instanceof Error ? error.message : error,
        );
      } finally {
        await page.close();
      }
    }

    const allViolations = pages.flatMap((page) => page.results.violations);

    const score = calculateScore(allViolations);

    return {
      url: validatedUrl.toString(),
      score,
      pages,
    };
  } finally {
    await context.close();
  }
}
