import { useMemo, useState } from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import { PriceDeltaWithRange } from './PriceDeltaWithRange';
import type { TimeRange } from '../../../lib/format';
import { previousPriceForRange } from '../../../lib/format';
import { usePriceHistory } from '../hooks';
import type { GridActions, Tracker } from '../types';

export function PriceHistoryCell(params: ICellRendererParams<Tracker>) {
    const tracker = params.data;
    const [range, setRange] = useState<TimeRange>('prev');

    // Lazy fetch: only request history when a non-default range is selected
    const { data: history, isLoading: isHistoryLoading } = usePriceHistory(
        range !== 'prev' ? (tracker?.id ?? null) : null,
    );

    const previousPrice = useMemo(() => {
        if (!tracker) return null;
        if (range === 'prev') return tracker.previousPrice;
        if (isHistoryLoading || !history) return null;
        return previousPriceForRange(range, history, tracker.previousPrice);
    }, [tracker, range, history, isHistoryLoading]);

    if (!tracker) return null;
    const actions = params.context as GridActions;

    return (
        <div className="pw-pricehistory-cell">
            <button className="pw-link-btn" onClick={() => actions.onShowHistory(tracker)}>
                View chart
            </button>
            <PriceDeltaWithRange
                currentPrice={tracker.currentPrice}
                previousPrice={previousPrice}
                currency={tracker.currency}
                range={range}
                onRangeChange={setRange}
            />
        </div>
    );
}
