import type { ICellRendererParams } from 'ag-grid-community';
import type { GridActions, Tracker } from '../types';

export function ActionsCell(params: ICellRendererParams<Tracker>) {
    const tracker = params.data;
    if (!tracker) return null;
    const actions = params.context as GridActions;
    const isActive = tracker.status === 'ACTIVE';

    return (
        <div className="pw-actions">
            <button className="pw-action" onClick={() => actions.onEdit(tracker)}>
                Edit
            </button>
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
            <button className="pw-action pw-danger" onClick={() => actions.onDelete(tracker)}>
                Delete
            </button>
        </div>
    );
}
