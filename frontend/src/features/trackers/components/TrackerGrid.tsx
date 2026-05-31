import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { formatDateTime, formatFrequency, formatPrice } from '../../../lib/format';
import type { GridActions, Tracker } from '../types';
import { ActionsCell } from './ActionsCell';
import { PriceHistoryCell } from './PriceHistoryCell';
import { ProductUrlCell } from './ProductUrlCell';
import { StatusCell } from './StatusCell';

ModuleRegistry.registerModules([AllCommunityModule]);

const columnDefs: ColDef<Tracker>[] = [
    { headerName: 'Product Name', field: 'productName', flex: 2, minWidth: 180 },
    { headerName: 'Website', field: 'website', flex: 1, minWidth: 120 },
    { headerName: 'Product URL', field: 'productUrl', flex: 2, minWidth: 160, cellRenderer: ProductUrlCell },
    {
        headerName: 'Current Price',
        colId: 'currentPrice',
        field: 'currentPrice',
        flex: 1,
        minWidth: 120,
        valueFormatter: (p) => formatPrice(p.data?.currentPrice ?? null, p.data?.currency ?? null),
    },
    {
        headerName: 'Price History',
        colId: 'priceHistory',
        minWidth: 130,
        cellRenderer: PriceHistoryCell,
        sortable: false,
        filter: false,
    },
    {
        headerName: 'Last Checked',
        field: 'lastCheckedAt',
        flex: 1,
        minWidth: 170,
        valueFormatter: (p) => formatDateTime(p.value as string | null),
    },
    {
        headerName: 'Check Frequency',
        field: 'checkFrequencyMinutes',
        flex: 1,
        minWidth: 150,
        valueFormatter: (p) => formatFrequency(p.value as number),
    },
    { headerName: 'Status', field: 'status', minWidth: 120, cellRenderer: StatusCell },
    {
        headerName: 'Actions',
        colId: 'actions',
        minWidth: 280,
        cellRenderer: ActionsCell,
        sortable: false,
        filter: false,
        pinned: 'right',
    },
];

interface Props {
    rows: Tracker[];
    actions: GridActions;
}

export function TrackerGrid({ rows, actions }: Props) {
    return (
        <div className="pw-grid-wrap">
            <AgGridReact<Tracker>
                theme={themeQuartz}
                rowData={rows}
                columnDefs={columnDefs}
                context={actions}
                getRowId={(p) => String(p.data.id)}
                defaultColDef={{ sortable: true, filter: true, resizable: true }}
                rowHeight={46}
                overlayNoRowsTemplate="No trackers yet — click “Add tracker” to create one."
            />
        </div>
    );
}
