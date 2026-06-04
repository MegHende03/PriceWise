import { computePercentChange } from '../lib/format';

interface Props {
    current: number | null | undefined;
    previous: number | null | undefined;
}

/**
 * Shows the percentage price change since the previous reading: a green "-15% ↘" when
 * the price dropped, a red "+21% ↗" when it rose, and a plain dash when it didn't move
 * (or there's no prior price to compare against).
 */
export function PriceChange({ current, previous }: Props) {
    const pct = computePercentChange(current, previous);
    const rounded = pct == null ? 0 : Math.round(pct);

    if (rounded === 0) {
        return <span className="pw-change pw-change-flat" title="No change since last check">—</span>;
    }

    const down = rounded < 0;
    const sign = down ? '' : '+'; // negatives already carry a leading minus
    return (
        <span className={`pw-change ${down ? 'pw-change-down' : 'pw-change-up'}`}>
            {sign}
            {rounded}%
            <span className="pw-change-arrow" aria-hidden="true">{down ? '↘' : '↗'}</span>
        </span>
    );
}
