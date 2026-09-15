import type { BrowserContext } from "playwright";

const MAX_PAGES = 10;

function normalizeUrl(value: string, origin: string) {
  try {
    const url = new URL(value, origin);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    if (url.origin !== origin) {
      return null;
    }

    url.hash = "";

    return url.toString();
  } catch {
    return null;
  }
}

export async function crawlWebsite(
  context: BrowserContext,
  startUrl: string,
  maxPages = MAX_PAGES,
) {
  const start = new URL(startUrl);

  const queue: string[] = [start.toString()];
  const visited = new Set<string>();

  const pages: string[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const currentUrl = queue.shift()!;

    if (visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    const page = await context.newPage();

    try {
      await page.goto(currentUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });

      pages.push(currentUrl);

      const links = await page
        .locator("a[href]")
        .evaluateAll((anchors) =>
          anchors
            .map((anchor) => (anchor as HTMLAnchorElement).href)
            .filter(Boolean),
        );

      for (const link of links) {
        const normalized = normalizeUrl(link, start.origin);

        if (
          normalized &&
          !visited.has(normalized) &&
          !queue.includes(normalized) &&
          queue.length + pages.length < maxPages
        ) {
          queue.push(normalized);
        }
      }
    } catch (error) {
      console.warn(
        `Failed to crawl ${currentUrl}:`,
        error instanceof Error ? error.message : error,
      );
    } finally {
      await page.close();
    }
  }

  return pages;
}
