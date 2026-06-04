export interface FrequencyPreset {
    label: string;
    minutes: number;
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
