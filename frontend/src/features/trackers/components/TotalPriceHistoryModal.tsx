import { useMemo, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Modal } from '../../../components/Modal';
import { PriceChange } from '../../../components/PriceChange';
import { formatPrice, timeRangeToCutoffMs } from '../../../lib/format';
import type { TimeRange } from '../../../lib/format';
import { RANGE_LABELS, RANGE_OPTIONS, SUMMARY_LABELS } from './PriceDeltaWithRange';
import { useTotalPriceHistory } from '../hooks';
import type { Tracker } from '../types';

interface Props {
    trackers: Tracker[];
    /** Sum of the latest prices, used for the "since last check" change indicator. */
    currentTotal: number | null;
    /** Sum of the prior-reading prices, used for the "since last check" change indicator. */
    previousTotal: number | null;
    isDark: boolean;
    onClose: () => void;
}

export function TotalPriceHistoryModal({ trackers, currentTotal, previousTotal, isDark, onClose }: Props) {
    const ids = trackers.map((t) => t.id);
    const { points, isLoading, error } = useTotalPriceHistory(ids);
    const [range, setRange] = useState<TimeRange>('prev');

    // Currency is only used for axis/tooltip labels; pick the first one present.
    const currency = trackers.find((t) => t.currency)?.currency ?? null;

    // Delta for the chosen range. 'prev' uses the precise since-last-check sums from the
    // props; other ranges read the aggregated total series (current = latest point,
    // previous = the total at/just before the window start, falling back to the earliest).
    const { current, previous } = useMemo(() => {
        if (range === 'prev') return { current: currentTotal, previous: previousTotal };
        if (points.length === 0) return { current: currentTotal, previous: null };
        const cutoff = timeRangeToCutoffMs(range)!;
        let prev: number | null = null;
        for (const p of points) {
            if (p.time <= cutoff) prev = p.price;
            else break;
        }
        return { current: points[points.length - 1].price, previous: prev ?? points[0].price };
    }, [range, points, currentTotal, previousTotal]);

    // Chart points, clipped to the selected window ('prev'/'all' show everything).
    const visiblePoints = useMemo(() => {
        const cutoff = timeRangeToCutoffMs(range);
        return cutoff == null ? points : points.filter((p) => p.time >= cutoff);
    }, [points, range]);

    return (
        <Modal title="Total tracked value — price history" onClose={onClose} width={760}>
            <div className="pw-change-summary">
                <span className="pw-change-summary-label">{SUMMARY_LABELS[range]}:</span>
                <PriceChange current={current} previous={previous} currency={currency} />
                <div className="pw-range-circles" role="group" aria-label="Time range">
                    {RANGE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`pw-range-circle ${range === opt.value ? 'pw-range-circle-active' : ''}`}
                            onClick={() => setRange(opt.value)}
                            title={opt.label}
                            aria-pressed={range === opt.value}
                        >
                            {RANGE_LABELS[opt.value]}
                        </button>
                    ))}
                </div>
            </div>
            {isLoading && <p>Loading price history…</p>}
            {error && <p className="pw-result-fail">Failed to load price history.</p>}
            {!isLoading && !error && points.length === 0 && (
                <p className="pw-hint">No price history recorded yet. It appears after the first successful check.</p>
            )}
            {!isLoading && !error && points.length > 0 && visiblePoints.length === 0 && (
                <p className="pw-hint">No readings in this time range. Try a longer range.</p>
            )}
            {visiblePoints.length > 0 && (
                <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={visiblePoints} margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(77, 212, 205, 0.2)' : 'rgba(37, 99, 235, 0.15)'} />
                        <XAxis
                            dataKey="time"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            scale="time"
                            tickFormatter={(value) => new Date(value as number).toLocaleDateString()}
                            tick={{ fill: isDark ? 'rgb(164, 203, 227)' : '#64748b' }}
                            tickMargin={10}
                            stroke={isDark ? 'rgba(77, 212, 205, 0.2)' : 'rgba(37, 99, 235, 0.15)'}
                        />
                        <YAxis
                            width={84}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => formatPrice(value as number, currency)}
                            tick={{ fill: isDark ? 'rgb(164, 203, 227)' : '#64748b' }}
                            stroke={isDark ? 'rgba(77, 212, 205, 0.2)' : 'rgba(37, 99, 235, 0.15)'}
                        />
                        <Tooltip
                            labelFormatter={(value) => new Date(value as number).toLocaleString()}
                            formatter={(value) => formatPrice(value as number, currency)}
                            contentStyle={isDark ? { background: 'rgb(8, 42, 62)', border: '1px solid rgba(77, 212, 205, 0.3)', color: 'rgb(226, 245, 243)' } : undefined}
                        />
                        <Line type="monotone" dataKey="price" stroke={isDark ? 'rgb(77, 212, 205)' : '#2563eb'} strokeWidth={2} dot />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Modal>
    );
}
