import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../../../components/Modal';
import { useAlert, useDeleteAlert, useSaveAlert } from '../hooks';
import type { Tracker } from '../types';
import { formatPrice } from '../../../lib/format';

interface Props {
    tracker: Tracker;
    onClose: () => void;
}

export function NotificationModal({ tracker, onClose }: Props) {
    const isManual = tracker.trackingMode === 'MANUAL';
    const { data: existingAlert, isLoading } = useAlert(tracker.id);
    const saveAlert = useSaveAlert();
    const deleteAlert = useDeleteAlert();

    const [email, setEmail] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (existingAlert) {
            setEmail(existingAlert.email);
            if (existingAlert.targetPrice != null) setTargetPrice(String(existingAlert.targetPrice));
        }
    }, [existingAlert]);

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setSaveError(null);
        try {
            await saveAlert.mutateAsync({
                trackerId: tracker.id,
                body: isManual
                    ? { email: email.trim(), alertType: 'WEEKLY_REMINDER' }
                    : { email: email.trim(), alertType: 'PRICE_DROP', targetPrice: Number(targetPrice) },
            });
            onClose();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save alert');
        }
    }

    async function handleDelete() {
        setSaveError(null);
        try {
            await deleteAlert.mutateAsync(tracker.id);
            onClose();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to remove alert');
        }
    }

    const title = isManual
        ? `Update Reminder — ${tracker.productName}`
        : `Price Alert — ${tracker.productName}`;

    return (
        <Modal title={title} onClose={onClose} width={440}>
            {isLoading ? (
                <p className="pw-hint">Loading…</p>
            ) : (
                <form className="pw-form" onSubmit={handleSave}>
                    <p className="pw-hint">
                        {isManual
                            ? 'Get a weekly email reminding you to check and update this item’s price.'
                            : 'Get an email when the price drops to or below your target.'}
                    </p>

                    <div className="pw-alert-current-price">
                        <span className="pw-alert-label">Current price</span>
                        <span className="pw-alert-value">
                            {formatPrice(tracker.currentPrice, tracker.currency)}
                        </span>
                    </div>

                    <label className="pw-field">
                        <span>Email address *</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </label>

                    {!isManual && (
                        <label className="pw-field">
                            <span>Target price *</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder={tracker.currentPrice != null ? String(tracker.currentPrice) : '0.00'}
                                required
                            />
                        </label>
                    )}

                    {existingAlert?.lastNotifiedAt && (
                        <p className="pw-hint">
                            {isManual ? 'Last reminded: ' : 'Last notified: '}
                            {new Date(existingAlert.lastNotifiedAt).toLocaleString()}
                        </p>
                    )}

                    <div className="pw-form-actions">
                        {existingAlert && (
                            <button
                                type="button"
                                className="pw-action pw-danger"
                                onClick={handleDelete}
                                disabled={deleteAlert.isPending}
                            >
                                {deleteAlert.isPending
                                    ? 'Removing…'
                                    : isManual
                                      ? 'Remove reminder'
                                      : 'Remove alert'}
                            </button>
                        )}
                        <button
                            type="submit"
                            className="pw-primary"
                            disabled={saveAlert.isPending}
                        >
                            {saveAlert.isPending
                                ? 'Saving…'
                                : existingAlert
                                  ? isManual ? 'Update reminder' : 'Update alert'
                                  : isManual ? 'Set reminder' : 'Set alert'}
                        </button>
                    </div>

                    {saveError && <p className="pw-result-fail">{saveError}</p>}
                </form>
            )}
        </Modal>
    );
}
