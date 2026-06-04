import { useMemo, useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { TrackerGrid } from './features/trackers/components/TrackerGrid';
import { TrackerFormModal } from './features/trackers/components/TrackerFormModal';
import { PriceHistoryModal } from './features/trackers/components/PriceHistoryModal';
import { TotalPriceHistoryModal } from './features/trackers/components/TotalPriceHistoryModal';
import { TestResultModal } from './features/trackers/components/TestResultModal';
import { PriceChange } from './components/PriceChange';
import {
    useCreateTrackerList,
    useDeleteTrackerList,
    useDeleteTracker,
    usePauseTracker,
    useResumeTracker,
    useTrackerLists,
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
    const { data: lists = [] } = useTrackerLists();
    const { mutateAsync: createListAsync } = useCreateTrackerList();
    const { mutate: deleteListMutate } = useDeleteTrackerList();
    const { mutate: pauseMutate } = usePauseTracker();
    const { mutate: resumeMutate } = useResumeTracker();
    const { mutate: deleteMutate } = useDeleteTracker();

    const [formModal, setFormModal] = useState<FormModalState | null>(null);
    const [historyTracker, setHistoryTracker] = useState<Tracker | null>(null);
    const [testTracker, setTestTracker] = useState<Tracker | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeListId, setActiveListId] = useState<number | null>(null);
    const [showTotalHistory, setShowTotalHistory] = useState(false);

    async function handleAddList(name: string) {
        const newList = await createListAsync(name);
        setActiveListId(newList.id);
    }

    function handleDeleteList(id: number) {
        deleteListMutate(id);
        if (activeListId === id) setActiveListId(null);
    }

    const activeList = useMemo(
        () => lists.find((l) => l.id === activeListId) ?? null,
        [lists, activeListId],
    );

    const filteredTrackers = useMemo(() => {
        if (!trackers) return [];
        if (activeListId === null) return trackers;
        return trackers.filter((t) => t.listId === activeListId);
    }, [trackers, activeListId]);

    const totalsByCurrency = useMemo(() => {
        const map = new Map<string, number>();
        for (const t of filteredTrackers) {
            if (t.currentPrice == null) continue;
            const key = t.currency ?? '';
            map.set(key, (map.get(key) ?? 0) + t.currentPrice);
        }
        return Array.from(map.entries());
    }, [filteredTrackers]);

    // Total change since last check: compare summed current vs prior prices, counting
    // only trackers that have both readings so a fresh tracker doesn't skew the percent.
    const totalChange = useMemo(() => {
        let current = 0;
        let previous = 0;
        let hasData = false;
        for (const t of filteredTrackers) {
            if (t.currentPrice == null || t.previousPrice == null) continue;
            current += t.currentPrice;
            previous += t.previousPrice;
            hasData = true;
        }
        return hasData ? { current, previous } : { current: null, previous: null };
    }, [filteredTrackers]);

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

            <div className="pw-body">
                <Sidebar
                    lists={lists}
                    activeListId={activeListId}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen((o) => !o)}
                    onAddList={handleAddList}
                    onDeleteList={handleDeleteList}
                    onSelectList={setActiveListId}
                />

                <main className="pw-main">
                    {activeList && (
                        <div className="pw-folder-heading">
                            <span className="pw-folder-heading-icon">▣</span>
                            <h2>{activeList.name}</h2>
                        </div>
                    )}
                    {isLoading && <p className="pw-status">Loading trackers…</p>}
                    {error && (
                        <p className="pw-status pw-result-fail">
                            Could not reach the API. Is the backend running on :8080?
                        </p>
                    )}
                    {!isLoading && !error && (
                        <TrackerGrid rows={filteredTrackers} actions={actions} />
                    )}
                </main>
            </div>

            {formModal && (
                <TrackerFormModal
                    mode={formModal.mode}
                    tracker={formModal.tracker}
                    listId={
                        formModal.mode === 'create'
                            ? activeListId
                            : (formModal.tracker?.listId ?? null)
                    }
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
                <span className="pw-totals-label">
                    {activeList ? `${activeList.name} total` : 'Total tracked value'}
                </span>
                <div className="pw-totals-right">
                    {totalsByCurrency.length > 0 && (
                        <button className="pw-link-btn" onClick={() => setShowTotalHistory(true)}>
                            View chart
                        </button>
                    )}
                    <PriceChange current={totalChange.current} previous={totalChange.previous} />
                    <span className="pw-totals-value">
                        {totalsByCurrency.length === 0
                            ? '—'
                            : totalsByCurrency
                                  .map(([currency, sum]) => formatPrice(sum, currency || null))
                                  .join('  ·  ')}
                    </span>
                </div>
            </footer>

            {showTotalHistory && (
                <TotalPriceHistoryModal
                    trackers={filteredTrackers}
                    currentTotal={totalChange.current}
                    previousTotal={totalChange.previous}
                    onClose={() => setShowTotalHistory(false)}
                />
            )}
        </div>
    );
}

export default App;
