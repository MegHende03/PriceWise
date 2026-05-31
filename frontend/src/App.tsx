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
        </div>
    );
}

export default App;
