import type { ICellRendererParams } from 'ag-grid-community';
import { PriceChange } from '../../../components/PriceChange';
import type { GridActions, Tracker } from '../types';

export function PriceHistoryCell(params: ICellRendererParams<Tracker>) {
    const tracker = params.data;
    if (!tracker) return null;
    const actions = params.context as GridActions;
    return (
        <div className="pw-pricehistory-cell">
            <button className="pw-link-btn" onClick={() => actions.onShowHistory(tracker)}>
                View chart
            </button>
            <PriceChange current={tracker.currentPrice} previous={tracker.previousPrice} />
        </div>
    );
}
