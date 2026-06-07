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

const agDarkTheme = themeQuartz.withParams({
    accentColor: 'rgb(77, 212, 205)',
    backgroundColor: 'rgb(8, 42, 62)',
    foregroundColor: 'rgb(226, 245, 243)',
    borderColor: 'rgba(77, 212, 205, 0.18)',
    oddRowBackgroundColor: 'rgba(51, 60, 119, 0.08)',
    rowHoverColor: 'rgba(77, 212, 205, 0.06)',
    headerBackgroundColor: 'rgb(2, 18, 30)',
    headerTextColor: 'rgb(164, 203, 227)',
    selectedRowBackgroundColor: 'rgba(77, 212, 205, 0.12)',
    fontSize: 13,
    wrapperBorderRadius: 12,
    borderRadius: 4,
});

const agLightTheme = themeQuartz.withParams({
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    foregroundColor: '#0f172a',
    borderColor: 'rgba(15, 23, 42, 0.12)',
    oddRowBackgroundColor: 'rgba(241, 245, 249, 0.8)',
    rowHoverColor: 'rgba(37, 99, 235, 0.05)',
    headerBackgroundColor: '#f1f5f9',
    headerTextColor: '#64748b',
    selectedRowBackgroundColor: 'rgba(37, 99, 235, 0.10)',
    fontSize: 13,
    wrapperBorderRadius: 12,
    borderRadius: 4,
});

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
        flex: 1,
        minWidth: 180,
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
    { headerName: 'Status', field: 'status', width: 120, resizable: false, cellRenderer: StatusCell },
    {
        headerName: 'Actions',
        colId: 'actions',
        width: 360,
        resizable: false,
        suppressSizeToFit: true,
        cellRenderer: ActionsCell,
        sortable: false,
        filter: false,
        pinned: 'right',
    },
];

interface Props {
    rows: Tracker[];
    actions: GridActions;
    isDark: boolean;
}

export function TrackerGrid({ rows, actions, isDark }: Props) {
    return (
        <div className="pw-grid-wrap">
            <AgGridReact<Tracker>
                theme={isDark ? agDarkTheme : agLightTheme}
                rowData={rows}
                columnDefs={columnDefs}
                context={actions}
                getRowId={(p) => String(p.data.id)}
                defaultColDef={{ sortable: true, filter: true, resizable: true }}
                rowHeight={46}
                overlayNoRowsTemplate='No trackers yet — click &ldquo;Add tracker&rdquo; to create one.'
            />
        </div>
    );
}
