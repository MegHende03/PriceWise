import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../../../components/Modal';
import { formatPrice } from '../../../lib/format';
import { useRecordManualPrice } from '../hooks';
import type { Tracker } from '../types';

interface Props {
    tracker: Tracker;
    onClose: () => void;
}

export function ManualPriceModal({ tracker, onClose }: Props) {
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState(tracker.currency ?? 'USD');
    const [error, setError] = useState<string | null>(null);
    const recordPrice = useRecordManualPrice();

    const parsed = Number(price);
    const valid = price.trim() !== '' && Number.isFinite(parsed) && parsed > 0;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!valid) return;
        setError(null);
        try {
            await recordPrice.mutateAsync({
                id: tracker.id,
                body: { price: parsed, currency: currency.trim() || null },
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to record price');
        }
    }

    return (
        <Modal title={`Update price — ${tracker.productName}`} onClose={onClose} width={460}>
            <form className="pw-form" onSubmit={handleSubmit}>
                {tracker.currentPrice != null && (
                    <div className="pw-alert-current-price">
                        <span className="pw-alert-label">Current price</span>
                        <span className="pw-alert-value">
                            {formatPrice(tracker.currentPrice, tracker.currency)}
                        </span>
                    </div>
                )}

                <div className="pw-field-row">
                    <label className="pw-field" style={{ flex: 2 }}>
                        <span>New price *</span>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g. 349.99"
                            autoFocus
                            required
                        />
                    </label>
                    <label className="pw-field" style={{ flex: 1 }}>
                        <span>Currency</span>
                        <input
                            type="text"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            placeholder="USD"
                            maxLength={8}
                        />
                    </label>
                </div>

                <p className="pw-hint">
                    Recorded as a new point on the price-history chart.
                </p>

                <div className="pw-form-actions">
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit" className="pw-primary" disabled={!valid || recordPrice.isPending}>
                        {recordPrice.isPending ? 'Saving…' : 'Save price'}
                    </button>
                </div>

                {error && <p className="pw-result-fail">{error}</p>}
            </form>
        </Modal>
    );
}
