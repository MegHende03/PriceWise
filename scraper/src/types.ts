/** Request body accepted by POST /scrape. */
export interface ScrapeRequest {
    /** Absolute product URL to load. */
    url: string;
    /** CSS selector locating the price element. */
    priceSelector: string;
    /** Optional CSS selector locating an availability/stock element. */
    availabilitySelector?: string;
    /** How long to wait (ms) for the price element to become visible. Default 10000. */
    waitTimeMs?: number;
    /** Route the request through the configured proxy pool when true. */
    proxyEnabled?: boolean;
}

export type ScrapeErrorType =
    | 'selector_not_found'
    | 'blocked'
    | 'timeout'
    | 'navigation'
    | 'error';

export interface ScrapeSuccess {
    success: true;
    /** Parsed numeric price, or null if the text could not be parsed. */
    price: number | null;
    /** Raw price text exactly as scraped. */
    priceRaw: string;
    /** ISO 4217 code inferred from the price text (USD, EUR, ...), or null. */
    currency: string | null;
    /** Raw availability text, or null when no selector was supplied / not found. */
    availability: string | null;
    /** Page <title>, useful as a default product name. */
    title: string | null;
    url: string;
    /** ISO-8601 timestamp of the scrape. */
    scrapedAt: string;
    /** Whether the request was routed through a proxy. */
    proxyUsed: boolean;
}

export interface ScrapeFailure {
    success: false;
    error: string;
    errorType: ScrapeErrorType;
    httpStatus?: number;
    url: string;
    scrapedAt: string;
    proxyUsed: boolean;
}

export type ScrapeResult = ScrapeSuccess | ScrapeFailure;
