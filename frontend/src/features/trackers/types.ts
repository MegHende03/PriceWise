export type Status = 'ACTIVE' | 'PAUSED' | 'FAILED' | 'BLOCKED';

export interface Tracker {
    id: number;
    productName: string;
    website: string | null;
    productUrl: string;
    priceSelector: string;
    availabilitySelector: string | null;
    waitTimeMs: number;
    checkFrequencyMinutes: number;
    proxyEnabled: boolean;
    status: Status;
    currentPrice: number | null;
    currency: string | null;
    lastCheckedAt: string | null;
    nextCheckAt: string | null;
    lastError: string | null;
}

export interface TrackerRequest {
    productName: string;
    productUrl: string;
    priceSelector: string;
    availabilitySelector?: string | null;
    waitTimeMs: number;
    checkFrequencyMinutes: number;
    proxyEnabled: boolean;
}

export interface TestScrapeRequest {
    productUrl: string;
    priceSelector: string;
    availabilitySelector?: string | null;
    waitTimeMs: number;
    proxyEnabled: boolean;
}

export interface ScrapeResult {
    success: boolean;
    price: number | null;
    priceRaw: string | null;
    currency: string | null;
    availability: string | null;
    title: string | null;
    url: string | null;
    scrapedAt: string | null;
    proxyUsed: boolean | null;
    error: string | null;
    errorType: string | null;
    httpStatus: number | null;
}

export interface PricePoint {
    price: number;
    currency: string | null;
    availability: string | null;
    scrapedAt: string;
}

/** Row-action callbacks passed to the grid via Ag Grid's `context`. */
export interface GridActions {
    onEdit: (tracker: Tracker) => void;
    onTest: (tracker: Tracker) => void;
    onPause: (tracker: Tracker) => void;
    onResume: (tracker: Tracker) => void;
    onDelete: (tracker: Tracker) => void;
    onShowHistory: (tracker: Tracker) => void;
}
