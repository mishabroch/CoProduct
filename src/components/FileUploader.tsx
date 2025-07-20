import { useState } from "react";
import {
  Button,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add, Upload, Edit, ConfirmationNumber } from "@mui/icons-material";
import { CreateFeatureRequestDto } from "../api/nswag-api-client";
import AddDocModal from "./AddDocModal";

interface FileUploaderProps {
  onFeatureRequestParsed?: (featureRequest: CreateFeatureRequestDto) => void;
  onAddManually?: () => void;
  onAddTickets?: () => void;
}

export default function FileUploader({
  onFeatureRequestParsed,
  onAddManually,
  onAddTickets,
}: FileUploaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddDoc = () => {
    handleMenuClose();
    setShowAddDocModal(true);
  };

  const handleAddManually = () => {
    handleMenuClose();
    onAddManually?.();
  };

  const handleAddTickets = () => {
    handleMenuClose();
    onAddTickets?.();
  };

  const handleAddDocModalClose = () => {
    setShowAddDocModal(false);
  };

  const handleAddDocSuccess = (featureRequest: CreateFeatureRequestDto) => {
    if (onFeatureRequestParsed) {
      onFeatureRequestParsed(featureRequest);
    }
  };

  return (
    <Box sx={{ textAlign: "center", p: 3 }}>
      <Button
        variant="contained"
        startIcon={<Add />}
        size="large"
        onClick={handleMenuClick}
        aria-controls={open ? "add-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        Add
      </Button>

      <Menu
        id="add-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "add-button",
        }}
      >
        <MenuItem onClick={handleAddDoc}>
          <ListItemIcon>
            <Upload fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add doc</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddManually}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add manually</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddTickets}>
          <ListItemIcon>
            <ConfirmationNumber fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add tickets</ListItemText>
        </MenuItem>
      </Menu>

      {/* Модальное окно для добавления документа */}
      <AddDocModal
        open={showAddDocModal}
        onClose={handleAddDocModalClose}
        onSuccess={handleAddDocSuccess}
      />
    </Box>
  );
}
