import { Configuration, LogLevel, PlaywrightCrawler, log } from 'crawlee';
import { buildProxyConfiguration } from './proxy';
import { parsePrice } from './parsePrice';
import type { ScrapeErrorType, ScrapeRequest, ScrapeResult } from './types';

const LOG_LEVELS: Record<string, LogLevel> = {
    DEBUG: LogLevel.DEBUG,
    INFO: LogLevel.INFO,
    WARNING: LogLevel.WARNING,
    ERROR: LogLevel.ERROR,
    OFF: LogLevel.OFF,
};
log.setLevel(LOG_LEVELS[(process.env.CRAWLEE_LOG_LEVEL ?? 'WARNING').toUpperCase()] ?? LogLevel.WARNING);

const DEFAULT_WAIT_MS = 10_000;

// Built once at startup; reused across requests. undefined => scrape from direct IP.
const proxyConfiguration = buildProxyConfiguration();

const BLOCK_MARKERS = [
    'captcha',
    'are you a robot',
    'robot check',
    'verify you are a human',
    'unusual traffic',
    'access denied',
    'enter the characters you see below',
];

function looksBlocked(html: string): boolean {
    const lower = html.toLowerCase();
    return BLOCK_MARKERS.some((marker) => lower.includes(marker));
}

/**
 * Runs a single on-demand scrape and resolves to a structured result. A fresh
 * PlaywrightCrawler is created per call with in-memory storage so requests stay
 * isolated and nothing is written to disk; the browser is torn down afterwards.
 * Slower than a long-lived browser, but simple and correct for on-demand use.
 */
export async function runScrape(req: ScrapeRequest): Promise<ScrapeResult> {
    const scrapedAt = new Date().toISOString();
    const waitMs = req.waitTimeMs ?? DEFAULT_WAIT_MS;
    const proxyUsed = Boolean(req.proxyEnabled && proxyConfiguration);
    let result: ScrapeResult | null = null;

    const crawler = new PlaywrightCrawler(
        {
            ...(proxyUsed ? { proxyConfiguration } : {}),
            maxRequestRetries: 1,
            navigationTimeoutSecs: 60,
            requestHandlerTimeoutSecs: Math.ceil(waitMs / 1000) + 45,
            headless: true,
            async requestHandler({ page, request, response }) {
                const httpStatus = response?.status();
                if (httpStatus === 403 || httpStatus === 429) {
                    result = {
                        success: false,
                        error: `Target responded with HTTP ${httpStatus} (likely blocked)`,
                        errorType: 'blocked',
                        httpStatus,
                        url: request.url,
                        scrapedAt,
                        proxyUsed,
                    };
                    return;
                }

                try {
                    // 'attached' (not 'visible'): price nodes are often present-but-hidden until the
                    // page hydrates (e.g. an initially `display:none` element), and we read textContent
                    // regardless of visibility. The non-zero-value wait below handles late population.
                    await page.waitForSelector(req.priceSelector, { timeout: waitMs, state: 'attached' });
                } catch {
                    const html = await page.content();
                    if (looksBlocked(html)) {
                        result = {
                            success: false,
                            error: 'Page looks like a CAPTCHA / bot check rather than the product page',
                            errorType: 'blocked',
                            httpStatus,
                            url: request.url,
                            scrapedAt,
                            proxyUsed,
                        };
                    } else {
                        result = {
                            success: false,
                            error: `Price selector not found within ${waitMs}ms: ${req.priceSelector}`,
                            errorType: 'selector_not_found',
                            httpStatus,
                            url: request.url,
                            scrapedAt,
                            proxyUsed,
                        };
                    }
                    return;
                }

                // The element can exist immediately while rendering a placeholder (e.g. "$0") until
                // the page hydrates the real price via XHR. Wait — up to the remaining budget — until
                // its text contains a non-zero number. If it never does, fall through and read as-is.
                try {
                    await page.waitForFunction(
                        (sel) => {
                            const el = document.querySelector(sel);
                            if (!el) return false;
                            return /[1-9]/.test((el.textContent ?? '').replace(/[^0-9]/g, ''));
                        },
                        req.priceSelector,
                        { timeout: waitMs, polling: 250 },
                    );
                } catch {
                    // Price stayed empty/zero within the wait budget; read whatever is present.
                }

                const priceRaw = (await page.locator(req.priceSelector).first().textContent())?.trim() ?? '';
                const { value, currency } = parsePrice(priceRaw);

                let availability: string | null = null;
                if (req.availabilitySelector) {
                    try {
                        availability =
                            (await page.locator(req.availabilitySelector).first().textContent({ timeout: 3000 }))?.trim() ??
                            null;
                    } catch {
                        availability = null;
                    }
                }

                const title = (await page.title())?.trim() || null;

                result = {
                    success: true,
                    price: value,
                    priceRaw,
                    currency,
                    availability,
                    title,
                    url: request.url,
                    scrapedAt,
                    proxyUsed,
                };
            },
            failedRequestHandler({ request }, error) {
                if (result) return; // a more specific result was already produced
                const message = error instanceof Error ? error.message : String(error);
                const lower = message.toLowerCase();
                let errorType: ScrapeErrorType = 'error';
                if (lower.includes('timeout')) errorType = 'timeout';
                else if (lower.includes('net::') || lower.includes('navigat')) errorType = 'navigation';
                result = {
                    success: false,
                    error: message,
                    errorType,
                    url: request.url,
                    scrapedAt,
                    proxyUsed,
                };
            },
        },
        new Configuration({ persistStorage: false }),
    );

    try {
        await crawler.run([req.url]);
    } finally {
        await crawler.teardown();
    }

    return (
        result ?? {
            success: false,
            error: 'Scrape produced no result',
            errorType: 'error',
            url: req.url,
            scrapedAt,
            proxyUsed,
        }
    );
}
