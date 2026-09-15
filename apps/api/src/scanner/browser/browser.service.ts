import { chromium, type Browser, type BrowserContext } from "playwright";

let browser: Browser | null = null;

export async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
    });
  }

  return browser;
}

export async function createBrowserContext(): Promise<BrowserContext> {
  const browser = await getBrowser();

  return browser.newContext({
    viewport: {
      width: 1440,
      height: 900,
    },
  });
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
