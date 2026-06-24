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
import { usePriceHistory } from '../hooks';
import type { Tracker } from '../types';

interface Props {
    tracker: Tracker;
    onClose: () => void;
}

export function PriceHistoryModal({ tracker, onClose }: Props) {
    const { data, isLoading, error } = usePriceHistory(tracker.id);

    const points = (data ?? []).map((point) => ({
        time: new Date(point.scrapedAt).getTime(),
        price: point.price,
    }));

    return (
        <Modal title={`Price history — ${tracker.productName}`} onClose={onClose} width={760}>
            <div className="pw-change-summary">
                <span className="pw-change-summary-label">Since last check</span>
                <PriceChange current={tracker.currentPrice} previous={tracker.previousPrice} />
            </div>
            {isLoading && <p>Loading price history…</p>}
            {error && <p className="pw-result-fail">Failed to load price history.</p>}
            {!isLoading && !error && points.length === 0 && (
                <p className="pw-hint">No price history recorded yet. It appears after the first successful check.</p>
            )}
            {points.length > 0 && (
                <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={points} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            scale="time"
                            tickFormatter={(value) => new Date(value as number).toLocaleDateString()}
                        />
                        <YAxis
                            width={84}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => formatPrice(value as number, tracker.currency)}
                        />
                        <Tooltip
                            labelFormatter={(value) => new Date(value as number).toLocaleString()}
                            formatter={(value) => formatPrice(value as number, tracker.currency)}
                        />
                        <Line type="monotone" dataKey="price" stroke="#1f6feb" strokeWidth={2} dot />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Modal>
    );
}
