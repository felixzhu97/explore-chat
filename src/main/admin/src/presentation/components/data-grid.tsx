"use client";

import { useMemo } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { AllCommunityModule } from "ag-grid-community";
import { styled } from "@/src/shared/utils/emotion";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const GridWrapper = styled.div<{ $clickable?: boolean }>`
  height: 520px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: var(--admin-surface);
  &.ag-theme-alpine {
    --ag-foreground-color: var(--admin-text);
    --ag-background-color: var(--admin-surface);
    --ag-header-background-color: var(--admin-surface);
    --ag-border-color: var(--admin-border);
    --ag-row-hover-color: var(--admin-surface-alt);
    --ag-selected-row-background-color: rgba(0, 149, 246, 0.1);
  }
  ${(p) =>
    p.$clickable &&
    `
    .ag-row {
      cursor: pointer;
    }
  `}
`;

const modules = [AllCommunityModule];

interface DataGridProps<T> {
  rowData: T[];
  columnDefs: import("ag-grid-community").ColDef<T>[];
  loading?: boolean;
  rowHeight?: number;
  getRowId?: (params: { data: T }) => string;
  onRowClicked?: (params: { data: T }) => void;
}

export function DataGrid<T extends Record<string, unknown>>({
  rowData,
  columnDefs,
  loading = false,
  rowHeight = 80,
  getRowId,
  onRowClicked,
}: DataGridProps<T>) {
  const themeClass = "ag-theme-alpine";

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
    }),
    []
  );

  return (
    <AgGridProvider modules={modules}>
      <GridWrapper className={`ag-admin-grid ${themeClass}`} $clickable={!!onRowClicked}>
        <AgGridReact
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowHeight={rowHeight}
          getRowId={getRowId as never}
          onRowClicked={onRowClicked as never}
          loading={loading}
          suppressCellFocus
          domLayout="normal"
        />
      </GridWrapper>
    </AgGridProvider>
  );
}
