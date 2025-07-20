import React from 'react';

import {   MaterialReactTable, type MRT_RowData, type MRT_TableInstance } from 'material-react-table';

interface Props<TData extends MRT_RowData> {
  table: MRT_TableInstance<TData>;
}

const CustomTable = <TData extends MRT_RowData>({ table }: Props<TData>) => {
  return <MaterialReactTable table={table} />;
};

export default CustomTable;
