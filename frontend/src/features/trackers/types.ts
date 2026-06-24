export type Status = 'ACTIVE' | 'PAUSED' | 'FAILED' | 'BLOCKED';

export type TrackingMode = 'SCRAPED' | 'MANUAL';

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
    trackingMode: TrackingMode;
    currentPrice: number | null;
    previousPrice: number | null;
    currency: string | null;
    lastCheckedAt: string | null;
    nextCheckAt: string | null;
    lastError: string | null;
    listId: number | null;
}

export interface TrackerRequest {
    productName: string;
    productUrl: string;
    priceSelector?: string | null;
    availabilitySelector?: string | null;
    waitTimeMs: number;
    checkFrequencyMinutes: number;
    proxyEnabled: boolean;
    trackingMode: TrackingMode;
    listId?: number | null;
}

export interface ManualPriceRequest {
    price: number;
    currency?: string | null;
}

export interface ScrapeStat {
    website: string;
    successCount: number;
    failureCount: number;
    sampleSize: number;
    successRate: number | null;
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

export interface TrackerList {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export type AlertType = 'PRICE_DROP' | 'WEEKLY_REMINDER';

export interface NotificationAlert {
    id: number;
    trackerId: number;
    email: string;
    alertType: AlertType;
    targetPrice: number | null;
    lastNotifiedAt: string | null;
}

export interface NotificationAlertRequest {
    email: string;
    alertType: AlertType;
    targetPrice?: number | null;
}

/** Row-action callbacks passed to the grid via Ag Grid's `context`. */
export interface GridActions {
    onEdit: (tracker: Tracker) => void;
    onTest: (tracker: Tracker) => void;
    onPause: (tracker: Tracker) => void;
    onResume: (tracker: Tracker) => void;
    onDelete: (tracker: Tracker) => void;
    onShowHistory: (tracker: Tracker) => void;
    onNotify: (tracker: Tracker) => void;
    onUpdatePrice: (tracker: Tracker) => void;
}
