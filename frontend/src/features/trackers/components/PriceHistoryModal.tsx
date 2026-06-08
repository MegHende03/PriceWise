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
import { formatPrice, previousPriceForRange, timeRangeToCutoffMs } from '../../../lib/format';
import type { TimeRange } from '../../../lib/format';
import { RANGE_LABELS, RANGE_OPTIONS, SUMMARY_LABELS } from './PriceDeltaWithRange';
import { usePriceHistory } from '../hooks';
import type { Tracker } from '../types';

interface Props {
    tracker: Tracker;
    isDark: boolean;
    onClose: () => void;
}

export function PriceHistoryModal({ tracker, isDark, onClose }: Props) {
    const { data, isLoading, error } = usePriceHistory(tracker.id);
    const [range, setRange] = useState<TimeRange>('prev');

    const history = useMemo(() => data ?? [], [data]);

    // Baseline price for the chosen range, mirroring the grid-row delta logic.
    const previousForRange = useMemo(
        () => previousPriceForRange(range, history, tracker.previousPrice),
        [range, history, tracker.previousPrice],
    );

    // Chart points, clipped to the selected window ('prev'/'all' show everything).
    const points = useMemo(() => {
        const all = history.map((point) => ({
            time: new Date(point.scrapedAt).getTime(),
            price: point.price,
        }));
        const cutoff = timeRangeToCutoffMs(range);
        return cutoff == null ? all : all.filter((p) => p.time >= cutoff);
    }, [history, range]);

    const hasHistory = history.length > 0;

    return (
        <Modal title={`Price history — ${tracker.productName}`} onClose={onClose} width={760}>
            <div className="pw-change-summary">
                <span className="pw-change-summary-label">{SUMMARY_LABELS[range]}:</span>
                <PriceChange current={tracker.currentPrice} previous={previousForRange} currency={tracker.currency} />
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
            {!isLoading && !error && !hasHistory && (
                <p className="pw-hint">No price history recorded yet. It appears after the first successful check.</p>
            )}
            {!isLoading && !error && hasHistory && points.length === 0 && (
                <p className="pw-hint">No readings in this time range. Try a longer range.</p>
            )}
            {points.length > 0 && (
                <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={points} margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
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
                            tickFormatter={(value) => formatPrice(value as number, tracker.currency)}
                            tick={{ fill: isDark ? 'rgb(164, 203, 227)' : '#64748b' }}
                            stroke={isDark ? 'rgba(77, 212, 205, 0.2)' : 'rgba(37, 99, 235, 0.15)'}
                        />
                        <Tooltip
                            labelFormatter={(value) => new Date(value as number).toLocaleString()}
                            formatter={(value) => formatPrice(value as number, tracker.currency)}
                            contentStyle={isDark ? { background: 'rgb(8, 42, 62)', border: '1px solid rgba(77, 212, 205, 0.3)', color: 'rgb(226, 245, 243)' } : undefined}
                        />
                        <Line type="monotone" dataKey="price" stroke={isDark ? 'rgb(77, 212, 205)' : '#2563eb'} strokeWidth={2} dot />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Modal>
    );
}
