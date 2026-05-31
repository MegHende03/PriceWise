import type { ICellRendererParams } from 'ag-grid-community';
import type { GridActions, Tracker } from '../types';

export function PriceHistoryCell(params: ICellRendererParams<Tracker>) {
    const tracker = params.data;
    if (!tracker) return null;
    const actions = params.context as GridActions;
    return (
        <button className="pw-link-btn" onClick={() => actions.onShowHistory(tracker)}>
            View chart
        </button>
    );
}
