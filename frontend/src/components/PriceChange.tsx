import { computePercentChange, formatPrice } from '../lib/format';

interface Props {
    current: number | null | undefined;
    previous: number | null | undefined;
    currency?: string | null;
}

export function PriceChange({ current, previous, currency }: Props) {
    // No prior reading to compare against counts as no change: show $0.00, never a dash.
    const diff = current != null && previous != null ? current - previous : 0;

    if (Math.abs(diff) < 0.005) {
        return (
            <span className="pw-change pw-change-flat" title="No change">
                {formatPrice(0, currency ?? null)}
            </span>
        );
    }

    const up = diff > 0;
    const pct = computePercentChange(current, previous);
    const pctAbs = pct != null ? Math.abs(pct).toFixed(2) : null;
    const arrow = up ? '↑' : '↓';
    const hoverText = pctAbs != null ? `${arrow}${pctAbs}%` : '';

    return (
        <span
            className={`pw-change ${up ? 'pw-change-up' : 'pw-change-down'}`}
            title={hoverText}
        >
            <span className="pw-change-arrow" aria-hidden="true">{arrow}</span>
            {formatPrice(diff, currency ?? null)}
        </span>
    );
}
