export interface FrequencyPreset {
    label: string;
    minutes: number;
}

export type TimeRange = 'prev' | '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

export function timeRangeToCutoffMs(range: TimeRange): number | null {
    if (range === 'prev') return null;
    const now = Date.now();
    switch (range) {
        case '1d': return now - 24 * 60 * 60 * 1000;
        case '1w': return now - 7 * 24 * 60 * 60 * 1000;
        case '1m': return now - 30 * 24 * 60 * 60 * 1000;
        case '3m': return now - 90 * 24 * 60 * 60 * 1000;
        case '6m': return now - 180 * 24 * 60 * 60 * 1000;
        case '1y': return now - 365 * 24 * 60 * 60 * 1000;
        case 'all': return 0;
    }
}

type PricePointLike = { scrapedAt: string; price: number };

/**
 * The baseline price to compare the current price against for a given range:
 *  - 'prev'    → the prior reading ({@code lastCheckPrevious}, e.g. tracker.previousPrice).
 *  - windowed  → the most recent reading at or before the window start.
 *  - 'all'     → the earliest recorded price.
 * When a window starts before any recorded reading (e.g. a young tracker, or 'all'),
 * it falls back to the earliest recorded price so the delta is still meaningful.
 * Returns null only when there's no usable history.
 */
export function previousPriceForRange(
    range: TimeRange,
    history: PricePointLike[],
    lastCheckPrevious: number | null | undefined,
): number | null {
    if (range === 'prev') return lastCheckPrevious ?? null;
    if (history.length === 0) return null;

    const sorted = [...history].sort(
        (a, b) => new Date(a.scrapedAt).getTime() - new Date(b.scrapedAt).getTime(),
    );
    const cutoffMs = timeRangeToCutoffMs(range);
    if (cutoffMs === null) return lastCheckPrevious ?? null;

    let result: number | null = null;
    for (const p of sorted) {
        if (new Date(p.scrapedAt).getTime() <= cutoffMs) result = p.price;
        else break;
    }
    // Nothing recorded before the window start: use the earliest reading as the baseline.
    return result ?? sorted[0].price;
}

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
    { label: 'Every 15 minutes', minutes: 15 },
    { label: 'Hourly', minutes: 60 },
    { label: 'Every 6 hours', minutes: 360 },
    { label: 'Every 12 hours', minutes: 720 },
    { label: 'Daily', minutes: 1440 },
    { label: 'Weekly', minutes: 10080 },
];

export function formatPrice(
    price: number | null | undefined,
    currency: string | null | undefined,
): string {
    if (price == null) return '—';
    if (currency) {
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);
        } catch {
            // Unknown/invalid currency code: fall through to a plain number.
        }
    }
    return price.toFixed(2);
}

/**
 * Percent change from {@code previous} to {@code current}, e.g. a drop from 100 → 85
 * returns -15. Returns {@code null} when a meaningful change cannot be computed
 * (missing data, or no prior price to compare against).
 */
export function computePercentChange(
    current: number | null | undefined,
    previous: number | null | undefined,
): number | null {
    if (current == null || previous == null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
}

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return 'Never';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
}

export function formatFrequency(minutes: number): string {
    const preset = FREQUENCY_PRESETS.find((p) => p.minutes === minutes);
    if (preset) return preset.label;
    if (minutes % 1440 === 0) return `Every ${minutes / 1440} day(s)`;
    if (minutes % 60 === 0) return `Every ${minutes / 60} hour(s)`;
    return `Every ${minutes} min`;
}
