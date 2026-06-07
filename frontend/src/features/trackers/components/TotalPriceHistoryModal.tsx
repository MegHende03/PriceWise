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
import { formatPrice } from '../../../lib/format';
import { useTotalPriceHistory } from '../hooks';
import type { Tracker } from '../types';

interface Props {
    trackers: Tracker[];
    /** Sum of the latest prices, used for the change indicator. */
    currentTotal: number | null;
    /** Sum of the prior-reading prices, used for the change indicator. */
    previousTotal: number | null;
    isDark: boolean;
    onClose: () => void;
}

export function TotalPriceHistoryModal({ trackers, currentTotal, previousTotal, isDark, onClose }: Props) {
    const ids = trackers.map((t) => t.id);
    const { points, isLoading, error } = useTotalPriceHistory(ids);

    // Currency is only used for axis/tooltip labels; pick the first one present.
    const currency = trackers.find((t) => t.currency)?.currency ?? null;

    return (
        <Modal title="Total tracked value — price history" onClose={onClose} width={760}>
            <div className="pw-change-summary">
                <span className="pw-change-summary-label">Since last check</span>
                <PriceChange current={currentTotal} previous={previousTotal} />
            </div>
            {isLoading && <p>Loading price history…</p>}
            {error && <p className="pw-result-fail">Failed to load price history.</p>}
            {!isLoading && !error && points.length === 0 && (
                <p className="pw-hint">No price history recorded yet. It appears after the first successful check.</p>
            )}
            {points.length > 0 && (
                <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={points} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(77, 212, 205, 0.2)' : 'rgba(37, 99, 235, 0.15)'} />
                        <XAxis
                            dataKey="time"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            scale="time"
                            tickFormatter={(value) => new Date(value as number).toLocaleDateString()}
                            tick={{ fill: isDark ? 'rgb(164, 203, 227)' : '#64748b' }}
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
