import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useState } from "react";
import { featureRequestStore } from "../stores";
import type { FeatureRequestResponseDto } from "../api/nswag-api-client";
import useCustomTable from "../components/useCustomTable";

// Компонент для таблицы Feature Requests
const FeatureRequestsTable: React.FC = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<FeatureRequestResponseDto | null>(null);

  const handleDeleteClick = (featureRequest: FeatureRequestResponseDto) => {
    setItemToDelete(featureRequest);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await featureRequestStore.deleteFeatureRequest(
        itemToDelete.id.toString()
      );
      await featureRequestStore.getFeatureRequests();
    } catch (error) {
      console.error("❌ Error deleting feature request:", error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const columns: MRT_ColumnDef<FeatureRequestResponseDto>[] = [
    {
      accessorKey: "customer",
      header: "Имя клиента",
      size: 200,
    },
    {
      accessorKey: "when",
      header: "When (контекст/триггер)",
      size: 300,
    },
    {
      accessorKey: "want",
      header: "Want (желаемый результат)",
      size: 300,
    },
    {
      accessorKey: "how",
      header: "How (критерии успеха)",
      size: 300,
    },
    {
      accessorKey: "soThat",
      header: "So That (глобальная цель)",
      size: 300,
    },
    {
      accessorKey: "featureRequests",
      header: "Feature Requests",
      size: 400,
    },
    {
      id: "actions",
      header: "Действия",
      size: 100,
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <Tooltip title="Удалить">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original);
            }}
            color="error"
            size="small"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const table = useCustomTable({
    columns,
    data: featureRequestStore.featureRequests,
    layoutMode: "grid",
    enableTopToolbar: true,
    enableColumnResizing: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enableFullScreenToggle: true,
    enableDensityToggle: false,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => navigate(`/feature-request/${row.original.id}`),
      sx: { cursor: "pointer" },
    }),
  });

  return (
    <>
      <MaterialReactTable table={table} />

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить feature request для клиента "
            {itemToDelete?.customer}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default observer(FeatureRequestsTable);
