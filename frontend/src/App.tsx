import { useMemo, useState } from 'react';
import './App.css';
import { TrackerGrid } from './features/trackers/components/TrackerGrid';
import { TrackerFormModal } from './features/trackers/components/TrackerFormModal';
import { PriceHistoryModal } from './features/trackers/components/PriceHistoryModal';
import { TestResultModal } from './features/trackers/components/TestResultModal';
import {
    useDeleteTracker,
    usePauseTracker,
    useResumeTracker,
    useTrackers,
} from './features/trackers/hooks';
import type { GridActions, Tracker } from './features/trackers/types';
import { formatPrice } from './lib/format';

interface FormModalState {
    mode: 'create' | 'edit';
    tracker?: Tracker;
}

function App() {
    const { data: trackers, isLoading, error } = useTrackers();
    const { mutate: pauseMutate } = usePauseTracker();
    const { mutate: resumeMutate } = useResumeTracker();
    const { mutate: deleteMutate } = useDeleteTracker();

    const [formModal, setFormModal] = useState<FormModalState | null>(null);
    const [historyTracker, setHistoryTracker] = useState<Tracker | null>(null);
    const [testTracker, setTestTracker] = useState<Tracker | null>(null);

    const totalsByCurrency = useMemo(() => {
        if (!trackers) return [];
        const map = new Map<string, number>();
        for (const t of trackers) {
            if (t.currentPrice == null) continue;
            const key = t.currency ?? '';
            map.set(key, (map.get(key) ?? 0) + t.currentPrice);
        }
        return Array.from(map.entries());
    }, [trackers]);

    const actions = useMemo<GridActions>(
        () => ({
            onEdit: (tracker) => setFormModal({ mode: 'edit', tracker }),
            onTest: (tracker) => setTestTracker(tracker),
            onPause: (tracker) => pauseMutate(tracker.id),
            onResume: (tracker) => resumeMutate(tracker.id),
            onDelete: (tracker) => {
                if (window.confirm(`Delete "${tracker.productName}"? This also removes its price history.`)) {
                    deleteMutate(tracker.id);
                }
            },
            onShowHistory: (tracker) => setHistoryTracker(tracker),
        }),
        [pauseMutate, resumeMutate, deleteMutate],
    );

    return (
        <div className="pw-app">
            <header className="pw-header">
                <h1>PriceWise</h1>
                <button className="pw-primary" onClick={() => setFormModal({ mode: 'create' })}>
                    + Add tracker
                </button>
            </header>

            <main className="pw-main">
                {isLoading && <p className="pw-status">Loading trackers…</p>}
                {error && (
                    <p className="pw-status pw-result-fail">
                        Could not reach the API. Is the backend running on :8080?
                    </p>
                )}
                {!isLoading && !error && <TrackerGrid rows={trackers ?? []} actions={actions} />}
            </main>

            {formModal && (
                <TrackerFormModal
                    mode={formModal.mode}
                    tracker={formModal.tracker}
                    onClose={() => setFormModal(null)}
                />
            )}
            {historyTracker && (
                <PriceHistoryModal tracker={historyTracker} onClose={() => setHistoryTracker(null)} />
            )}
            {testTracker && (
                <TestResultModal tracker={testTracker} onClose={() => setTestTracker(null)} />
            )}

            <footer className="pw-totals-bar">
                <span className="pw-totals-label">Total tracked value</span>
                <span className="pw-totals-value">
                    {totalsByCurrency.length === 0
                        ? '—'
                        : totalsByCurrency
                              .map(([currency, sum]) => formatPrice(sum, currency || null))
                              .join('  ·  ')}
                </span>
            </footer>
        </div>
    );
}

export default App;
