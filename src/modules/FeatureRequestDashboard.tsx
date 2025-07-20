import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import FeatureRequestsTable from "./FeatureRequestsTable";
import { featureRequestStore } from "../stores";
import { CreateFeatureRequestDto } from "../api/nswag-api-client";
import FileUploader from "../components/FileUploader";
import CreateFeatureRequestForm from "./CreateFeatureRequestForm";

const FeatureRequestDashboard = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showTicketsForm, setShowTicketsForm] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeatureRequestParsed = (
    _featureRequest: CreateFeatureRequestDto
  ) => {
    // Здесь можно добавить дополнительную логику при необходимости
  };

  const handleAddManually = () => {
    setShowManualDialog(true);
    setShowManualForm(false);
    setShowTicketsForm(false);
  };

  const handleAddTickets = () => {
    setShowTicketsForm(true);
    setShowManualForm(false);
    setShowManualDialog(false);
  };

  const handleFormSuccess = () => {
    setShowManualForm(false);
    setShowTicketsForm(false);
  };

  const handleManualDialogClose = () => {
    setShowManualDialog(false);
    setCustomerName("");
  };

  const handleManualDialogSubmit = async () => {
    if (!customerName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const createDto = new CreateFeatureRequestDto();
      createDto.customer = customerName.trim();

      await featureRequestStore.createFeatureRequest(createDto);

      // Обновляем данные в таблице после успешного создания
      await featureRequestStore.getFeatureRequests();

      handleManualDialogClose();
    } catch (error) {
      console.error("❌ Error creating feature request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    featureRequestStore.getFeatureRequests();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        CoPro
      </Typography>

      <FileUploader
        onFeatureRequestParsed={handleFeatureRequestParsed}
        onAddManually={handleAddManually}
        onAddTickets={handleAddTickets}
      />

      {/* Диалог для ручного добавления */}
      <Dialog
        open={showManualDialog}
        onClose={handleManualDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Добавить Feature Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Введите имя клиента для создания нового feature request
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Имя клиента"
            type="text"
            fullWidth
            variant="outlined"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Введите имя клиента..."
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleManualDialogClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button
            onClick={handleManualDialogSubmit}
            variant="contained"
            disabled={!customerName.trim() || isSubmitting}
          >
            {isSubmitting ? "Создание..." : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>

      {showManualForm && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Добавить Feature Request вручную
          </Typography>
          <CreateFeatureRequestForm onSuccess={handleFormSuccess} />
        </Box>
      )}

      {showTicketsForm && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Добавить Feature Request из тикетов
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Функциональность добавления из тикетов будет реализована позже
          </Typography>
        </Box>
      )}

      <FeatureRequestsTable />
    </Box>
  );
};

export default observer(FeatureRequestDashboard);
