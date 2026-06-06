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
    accentColor: 'rgb(147, 74, 14)',        /* #934A0E */
    backgroundColor: 'rgb(220, 197, 142)',  /* #DCC58E light tan surface */
    foregroundColor: 'rgb(60, 37, 15)',     /* #3C250F */
    borderColor: 'rgba(60, 37, 15, 0.28)',
    oddRowBackgroundColor: 'rgba(188, 135, 49, 0.14)',  /* #BC8731 golden stripe */
    rowHoverColor: 'rgba(60, 37, 15, 0.09)',
    headerBackgroundColor: 'rgba(220, 182, 30, 0.28)',  /* #DCB61E golden tint */
    headerTextColor: 'rgb(60, 37, 15)',
    selectedRowBackgroundColor: 'rgba(147, 74, 14, 0.18)',
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
    { headerName: 'Status', field: 'status', width: 95, resizable: false, cellRenderer: StatusCell },
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
