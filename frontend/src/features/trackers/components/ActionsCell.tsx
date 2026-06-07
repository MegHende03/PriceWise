import type { ICellRendererParams } from 'ag-grid-community';
import type { GridActions, Tracker } from '../types';

function BellIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }}
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

export function ActionsCell(params: ICellRendererParams<Tracker>) {
    const tracker = params.data;
    if (!tracker) return null;
    const actions = params.context as GridActions;
    const isActive = tracker.status === 'ACTIVE';
    const isManual = tracker.trackingMode === 'MANUAL';

    // Manual trackers aren't scraped or alert-able, so they get a minimal action set;
    // scraped trackers keep the full set (test, pause/resume, alert).
    return (
        <div className="pw-actions">
            <button className="pw-action" onClick={() => actions.onEdit(tracker)}>
                Edit
            </button>
            {isManual ? (
                <button className="pw-action" onClick={() => actions.onUpdatePrice(tracker)}>
                    Update price
                </button>
            ) : (
                <>
                    <button className="pw-action" onClick={() => actions.onTest(tracker)}>
                        Test scrape
                    </button>
                    {isActive ? (
                        <button className="pw-action" onClick={() => actions.onPause(tracker)}>
                            Pause
                        </button>
                    ) : (
                        <button className="pw-action" onClick={() => actions.onResume(tracker)}>
                            Resume
                        </button>
                    )}
                </>
            )}
            <button className="pw-action pw-danger" onClick={() => actions.onDelete(tracker)}>
                Delete
            </button>
            {!isManual && (
                <button
                    className="pw-action pw-action-bell"
                    onClick={() => actions.onNotify(tracker)}
                    title="Set price alert"
                >
                    <BellIcon />
                    Alert
                </button>
            )}
        </div>
    );
}
