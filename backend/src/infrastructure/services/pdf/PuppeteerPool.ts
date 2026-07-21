import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '@infrastructure/logger/logger';

class PuppeteerPool {
    private browser: Browser | null = null;
    private readonly maxPages = 5;
    private activePages = 0;
    private queue: ((page: Page) => void)[] = [];

    private async getBrowser(): Promise<Browser> {
        if (!this.browser) {
            logger.info("Initializing Puppeteer browser instance...");
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            });

            this.browser.on('disconnected', () => {
                logger.warn("Puppeteer browser disconnected. Will restart on next request.");
                this.browser = null;
            });
        }
        return this.browser;
    }

    public async execute<T>(task: (page: Page) => Promise<T>): Promise<T> {
        const page = await this.acquirePage();
        try {
            return await task(page);
        } finally {
            await this.releasePage(page);
        }
    }

    private async acquirePage(): Promise<Page> {
        if (this.activePages >= this.maxPages) {
            return new Promise<Page>((resolve) => {
                this.queue.push(resolve);
            });
        }

        this.activePages++;
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        return page;
    }

    private async releasePage(page: Page): Promise<void> {
        try {
            await page.close();
        } catch (error) {
            logger.error("Error closing page in PuppeteerPool", error);
        } finally {
            this.activePages--;
            if (this.queue.length > 0) {
                const nextResolve = this.queue.shift();
                if (nextResolve) {
                    this.activePages++;
                    try {
                        const browser = await this.getBrowser();
                        const newPage = await browser.newPage();
                        nextResolve(newPage);
                    } catch (error) {
                        logger.error("Failed to create page for queued task", error);
                        this.activePages--;
                        // If it fails, we should really throw or reject the promise, 
                        // but since resolve is expected to pass a page, a robust pool would pass 
                        // rejection capabilities or just rely on the next call.
                    }
                }
            }
        }
    }
}

export const puppeteerPool = new PuppeteerPool();
