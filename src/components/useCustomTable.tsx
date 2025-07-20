import {
  useMaterialReactTable,
  type MRT_RowData,
  type MRT_TableInstance,
  type MRT_TableOptions,
} from 'material-react-table';



const useCustomTable = <TData extends MRT_RowData>(
  tableOptions: MRT_TableOptions<TData>,
): MRT_TableInstance<TData> => {
  return useMaterialReactTable({
    defaultColumn: { minSize: 10, maxSize: 500, size: 150 },
    ...tableOptions,
  });
};

export default useCustomTable;
