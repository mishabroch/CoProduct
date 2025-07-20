import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { featureRequestStore } from "../stores";
import type { FeatureRequestResponseDto } from "../api/nswag-api-client";
import CreateFeatureRequestForm from "./CreateFeatureRequestForm";

// Компонент для детального просмотра Feature Request
const FeatureRequestDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [featureRequest, setFeatureRequest] =
    useState<FeatureRequestResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadFeatureRequest = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Сначала пытаемся найти в локальном store
        let request = featureRequestStore.featureRequests.find(
          (fr) => String(fr.id) === id
        );

        if (!request) {
          // Если не найден локально, загружаем из API
          request = await featureRequestStore.getFeatureRequestById(id);
        }

        if (request) {
          setFeatureRequest(request);
        } else {
          setError("Feature Request не найден");
        }
      } catch (error) {
        console.error("❌ Detail: Error loading feature request:", error);
        setError("Ошибка при загрузке Feature Request");
      } finally {
        setLoading(false);
      }
    };

    loadFeatureRequest();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFormSuccess = async () => {
    if (!id) return;

    try {
      // Заново запрашиваем данные по ID
      const updatedRequest = await featureRequestStore.getFeatureRequestById(
        id
      );

      if (updatedRequest) {
        setFeatureRequest(updatedRequest);
      }
    } catch (error) {
      console.error("❌ Detail: Error refreshing data:", error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !featureRequest) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {error || "Feature Request не найден"}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/")} sx={{ mt: 2 }}>
          ← Назад к списку
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Button variant="outlined" onClick={() => navigate("/")} sx={{ mb: 2 }}>
        ← Назад к списку
      </Button>

      {/* Имя клиента в отдельном Paper в левой верхней части */}
      <Paper sx={{ p: 2, mb: 3, maxWidth: 300 }}>
        <Typography variant="h6" gutterBottom>
          Имя клиента:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {featureRequest.customer}
        </Typography>
      </Paper>

      {/* Табы для переключения между просмотром и редактированием */}
      <Paper sx={{ mb: 3, width: "100%" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Просмотр" />
          <Tab label="Редактирование" />
        </Tabs>
      </Paper>

      {/* Контент табов */}
      {activeTab === 0 && (
        // Таб просмотра
        <Paper sx={{ p: 3, width: "100%" }}>
          <Typography variant="h4" gutterBottom>
            Feature Request #{id}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                When (контекст/триггер):
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {featureRequest.when}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Want (желаемый результат):
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {featureRequest.want}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                How (критерии успеха):
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {featureRequest.how}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                So That (глобальная цель):
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {featureRequest.soThat}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Feature Requests:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {featureRequest.featureRequests}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        // Таб редактирования
        <Box sx={{ width: "100%" }}>
          <CreateFeatureRequestForm
            initialData={featureRequest}
            onSuccess={handleFormSuccess}
          />
        </Box>
      )}
    </Box>
  );
};

export default observer(FeatureRequestDetail);
