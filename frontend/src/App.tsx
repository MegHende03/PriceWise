import { useEffect, useMemo, useState } from 'react';
import LoginModal from './components/LoginModal';
import { getStoredCredentials } from './api/client';

function SunIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM3.66865 3.71609C3.94815 3.41039 4.42255 3.38915 4.72825 3.66865L6.95026 5.70024C7.25596 5.97974 7.2772 6.45413 6.9977 6.75983C6.7182 7.06553 6.2438 7.08677 5.9381 6.80727L3.71609 4.77569C3.41039 4.49619 3.38915 4.02179 3.66865 3.71609ZM20.3314 3.71609C20.6109 4.02179 20.5896 4.49619 20.2839 4.77569L18.0619 6.80727C17.7562 7.08677 17.2818 7.06553 17.0023 6.75983C16.7228 6.45413 16.744 5.97974 17.0497 5.70024L19.2718 3.66865C19.5775 3.38915 20.0518 3.41039 20.3314 3.71609ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM17.0255 17.0252C17.3184 16.7323 17.7933 16.7323 18.0862 17.0252L20.3082 19.2475C20.6011 19.5404 20.601 20.0153 20.3081 20.3082C20.0152 20.6011 19.5403 20.601 19.2475 20.3081L17.0255 18.0858C16.7326 17.7929 16.7326 17.3181 17.0255 17.0252ZM6.97467 17.0253C7.26756 17.3182 7.26756 17.7931 6.97467 18.086L4.75244 20.3082C4.45955 20.6011 3.98468 20.6011 3.69178 20.3082C3.39889 20.0153 3.39889 19.5404 3.69178 19.2476L5.91401 17.0253C6.2069 16.7324 6.68177 16.7324 6.97467 17.0253ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
        </svg>
    );
}
import './App.css';
import owlLogo from '../assests/owl.svg';
import { Sidebar } from './components/Sidebar';
import { TrackerGrid } from './features/trackers/components/TrackerGrid';
import { TrackerFormModal } from './features/trackers/components/TrackerFormModal';
import { PriceHistoryModal } from './features/trackers/components/PriceHistoryModal';
import { ManualPriceModal } from './features/trackers/components/ManualPriceModal';
import { TotalPriceHistoryModal } from './features/trackers/components/TotalPriceHistoryModal';
import { TestResultModal } from './features/trackers/components/TestResultModal';
import { NotificationModal } from './features/trackers/components/NotificationModal';
import { PriceDeltaWithRange } from './features/trackers/components/PriceDeltaWithRange';
import type { TimeRange } from './lib/format';
import {
    useCreateTrackerList,
    useDeleteTrackerList,
    useDeleteTracker,
    usePauseTracker,
    useResumeTracker,
    useTrackerLists,
    useTrackers,
    useTotalPriceHistory,
} from './features/trackers/hooks';
import type { GridActions, Tracker } from './features/trackers/types';
import { formatPrice, timeRangeToCutoffMs } from './lib/format';

interface FormModalState {
    mode: 'create' | 'edit';
    tracker?: Tracker;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!getStoredCredentials());

    const { data: trackers, isLoading, error } = useTrackers();
    const { data: lists = [] } = useTrackerLists();
    const { mutateAsync: createListAsync } = useCreateTrackerList();
    const { mutate: deleteListMutate } = useDeleteTrackerList();
    const { mutate: pauseMutate } = usePauseTracker();
    const { mutate: resumeMutate } = useResumeTracker();
    const { mutate: deleteMutate } = useDeleteTracker();

    const [isDark, setIsDark] = useState(true);
    const [formModal, setFormModal] = useState<FormModalState | null>(null);
    const [historyTracker, setHistoryTracker] = useState<Tracker | null>(null);
    const [testTracker, setTestTracker] = useState<Tracker | null>(null);
    const [notifyTracker, setNotifyTracker] = useState<Tracker | null>(null);
    const [priceTracker, setPriceTracker] = useState<Tracker | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeListId, setActiveListId] = useState<number | null>(null);
    const [showTotalHistory, setShowTotalHistory] = useState(false);
    const [totalRange, setTotalRange] = useState<TimeRange>('prev');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

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

    // "Prev" delta: sum of current vs prior prices for trackers that have both readings.
    // Always computed — used by the modal and as the base for 'prev' range in the footer.
    const prevTotalChange = useMemo(() => {
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

    // Fetch aggregate history only when a non-prev range is selected in the footer.
    const totalHistoryIds = totalRange !== 'prev' ? filteredTrackers.map((t) => t.id) : [];
    const { points: totalHistoryPoints } = useTotalPriceHistory(totalHistoryIds);

    // Range-aware total delta for the footer.
    const totalChange = useMemo(() => {
        if (totalRange === 'prev') return prevTotalChange;
        let current = 0;
        let hasCurrentData = false;
        for (const t of filteredTrackers) {
            if (t.currentPrice == null) continue;
            current += t.currentPrice;
            hasCurrentData = true;
        }
        if (!hasCurrentData) return { current: null, previous: null };
        const cutoff = timeRangeToCutoffMs(totalRange)!;
        let previous: number | null = null;
        for (const point of totalHistoryPoints) {
            if (point.time <= cutoff) previous = point.price;
            else break;
        }
        return { current, previous };
    }, [filteredTrackers, totalRange, prevTotalChange, totalHistoryPoints]);

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
            onNotify: (tracker) => setNotifyTracker(tracker),
            onUpdatePrice: (tracker) => setPriceTracker(tracker),
        }),
        [pauseMutate, resumeMutate, deleteMutate],
    );

    if (!isLoggedIn) {
        return (
            <LoginModal
                isOpen={true}
                onLoginSuccess={() => setIsLoggedIn(true)}
            />
        );
    }

    return (
        <div className="pw-app">
            <header className="pw-header">
                <div className="pw-header-left">
                    <img src={owlLogo} alt="PriceWise logo" className="pw-logo" />
                    <h1>PriceWise</h1>
                </div>
                <div className="pw-header-actions">
                    <div className="pw-info-wrap">
                        <button className="pw-info-btn" aria-label="Tracking information">ⓘ</button>
                        <div className="pw-info-tooltip" role="tooltip">
                            ⚠️ Some retailers employ advanced anti-bot protections, dynamic content loading,
                            and frequent website updates that may occasionally prevent automatic price tracking.
                            Tracking reliability may vary for stores such as Amazon, Walmart, Costco, Best Buy, Home Depot,
                            Lowe's, Nike, Adidas, and Apple. If a price cannot be retrieved, please verify the product URL and
                            try again later.
                        </div>
                    </div>
                    <button
                        className="pw-theme-toggle"
                        onClick={() => setIsDark((d) => !d)}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? <SunIcon /> : <MoonIcon />}
                    </button>
                    <button className="pw-primary" onClick={() => setFormModal({ mode: 'create' })}>
                        + Add tracker
                    </button>
                </div>
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
                        <TrackerGrid rows={filteredTrackers} actions={actions} isDark={isDark} />
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
                <PriceHistoryModal tracker={historyTracker} isDark={isDark} onClose={() => setHistoryTracker(null)} />
            )}
            {testTracker && (
                <TestResultModal tracker={testTracker} onClose={() => setTestTracker(null)} />
            )}
            {notifyTracker && (
                <NotificationModal tracker={notifyTracker} onClose={() => setNotifyTracker(null)} />
            )}
            {priceTracker && (
                <ManualPriceModal tracker={priceTracker} onClose={() => setPriceTracker(null)} />
            )}

            <footer className="pw-totals-bar">
                <div className="pw-totals-left">
                    <span className="pw-totals-label">
                        {activeList ? `${activeList.name} total` : 'Total tracked value'}
                    </span>
                    {totalsByCurrency.length > 0 && (
                        <button className="pw-link-btn" onClick={() => setShowTotalHistory(true)}>
                            View chart
                        </button>
                    )}
                </div>
                <div className="pw-totals-right">
                    <PriceDeltaWithRange
                        currentPrice={totalChange.current}
                        previousPrice={totalChange.previous}
                        currency={filteredTrackers.find((t) => t.currency)?.currency ?? null}
                        range={totalRange}
                        onRangeChange={setTotalRange}
                        arrowUp
                    />
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
                    currentTotal={prevTotalChange.current}
                    previousTotal={prevTotalChange.previous}
                    isDark={isDark}
                    onClose={() => setShowTotalHistory(false)}
                />
            )}
        </div>
    );
}

export default App;
