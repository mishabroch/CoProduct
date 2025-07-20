import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import { Upload, CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import axios from "axios";
import { CreateFeatureRequestDto } from "../api/nswag-api-client";
import { featureRequestStore } from "../stores";

interface AddDocModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (featureRequest: CreateFeatureRequestDto) => void;
}

interface ProcessingStep {
  label: string;
  description: string;
  status: "pending" | "processing" | "completed" | "error";
}

export default function AddDocModal({
  open,
  onClose,
  onSuccess,
}: AddDocModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      label: "Загрузка файла",
      description: "Подготовка документа к анализу",
      status: "pending",
    },
    {
      label: "Анализ DeepSeek",
      description: "Анализ документа с помощью AI",
      status: "pending",
    },
    {
      label: "Обработка и сохранение",
      description: "Создание feature request",
      status: "pending",
    },
  ]);

  // Очищаем состояние при открытии диалога
  useEffect(() => {
    if (open) {
      setIsProcessing(false);
      setCurrentStep(0);
      setSuccess(null);
      setError(null);
      setSteps([
        {
          label: "Загрузка файла",
          description: "Подготовка документа к анализу",
          status: "pending",
        },
        {
          label: "Анализ DeepSeek",
          description: "Анализ документа с помощью AI",
          status: "pending",
        },
        {
          label: "Обработка и сохранение",
          description: "Создание feature request",
          status: "pending",
        },
      ]);
    }
  }, [open]);

  const API_KEY = import.meta.env.VITE_DEEPSEEK_KEY;
  const API_URL = "https://api.deepseek.com/v1/chat/completions";

  const updateStep = (stepIndex: number, status: ProcessingStep["status"]) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status } : step
      )
    );
  };

  const analyzeText = async (prompt: string, text: string): Promise<string> => {
    const response = await axios.post(
      API_URL,
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: `${prompt}\n\n${text}` }],
        temperature: 0.3,
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );
    return response.data.choices[0].message.content as string;
  };

  const transformData = (
    input: Record<string, unknown>
  ): CreateFeatureRequestDto => {
    const featureRequest = new CreateFeatureRequestDto();

    featureRequest.customer = String(
      (input.Пользователь as Record<string, unknown>)?.Имя || ""
    );

    // Функция для безопасного преобразования в строку
    const safeToString = (value: unknown): string => {
      if (typeof value === "string") return value;
      if (Array.isArray(value)) return value.join("\n");
      if (typeof value === "object" && value !== null) {
        // Если это объект, пытаемся извлечь текстовое содержимое
        const obj = value as Record<string, unknown>;
        if (obj.text) return String(obj.text);
        if (obj.content) return String(obj.content);
        if (obj.value) return String(obj.value);
        // Если ничего не найдено, конвертируем весь объект в JSON
        return JSON.stringify(value, null, 2);
      }
      return String(value || "");
    };

    featureRequest.when = safeToString(input["When (контекст/триггер)"]);
    featureRequest.want = safeToString(input["Want (желаемый результат)"]);
    featureRequest.how = safeToString(input["How (критерии успеха)"]);
    featureRequest.soThat = safeToString(input["So that (глобальная цель)"]);
    featureRequest.featureRequests = safeToString(input["Feature requests"]);

    return featureRequest;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setCurrentStep(0);
    setSteps((prev) =>
      prev.map((step) => ({ ...step, status: "pending" as const }))
    );

    try {
      // Шаг 1: Загрузка файла
      updateStep(0, "processing");

      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      updateStep(0, "completed");
      setCurrentStep(1);

      // Шаг 2: Анализ DeepSeek
      updateStep(1, "processing");

      const prompt = `Проанализируй этот скрипт разговора продукт-команды Planyway с пользователями через призму Advanced Jobs To Be Done (по Замесину)
Формат вывода результата - json:
1 пользователь - это 1 строка
столбцы:
1 Пользователь:
Имя, почта
2 When (контекст/триггер): 
- Ситуация, в которой возникает потребность
- Текущие ограничения/боли
3 Want (желаемый результат):
- Что хочет получить пользователь
4 How (критерии успеха):
- Как именно должен быть достигнут результат
- Какие особенности учитывать
5 So that (глобальная цель):
- "Чтобы что?" верхнеуровневый outcome
6 Feature requests
- Список фич, которые нужны пользователю

Правила:
Используй только цитаты пользователей
Не используй для анализа цитаты продуктовой команды (Yana, Sergey)
Избегай общих фраз, только конкретные боли из скрипта
Группируй смежные боли в один use case
Дополнительно:
Если в скрипте есть запросы на фичи (например, "Can we add vacation plans?"), выделяй их отдельным списком "Feature requests"
:`;

      const analysis = await analyzeText(prompt, fileContent);
      updateStep(1, "completed");
      setCurrentStep(2);

      // Шаг 3: Обработка данных и сохранение
      updateStep(2, "processing");

      let featureRequest: CreateFeatureRequestDto | null = null;
      try {
        const jsonMatch = analysis.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            featureRequest = transformData(parsedData[0]);
          }
        }
      } catch (parseError) {
        console.error(
          "❌ AddDocModal: Error parsing DeepSeek response:",
          parseError
        );
        updateStep(2, "error");
        throw new Error("Ошибка при обработке ответа от DeepSeek");
      }

      if (!featureRequest) {
        updateStep(2, "error");
        throw new Error("Не удалось создать feature request из анализа");
      }

      // Сохранение
      await featureRequestStore.createFeatureRequest(featureRequest);

      // Обновляем данные в таблице
      await featureRequestStore.getFeatureRequests();

      updateStep(2, "completed");
      setSuccess("Feature request успешно создан из документа!");

      // Вызываем callback для совместимости
      if (onSuccess) {
        onSuccess(featureRequest);
      }
    } catch (error) {
      console.error("❌ AddDocModal: Error processing file:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Ошибка при обработке файла. Попробуйте еще раз."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      // Очищаем состояние при закрытии
      setIsProcessing(false);
      setCurrentStep(0);
      setSuccess(null);
      setError(null);
    }
  };

  const getStepIcon = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle color="success" />;
      case "error":
        return <ErrorIcon color="error" />;
      case "processing":
        return <CircularProgress size={20} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isProcessing}
    >
      <DialogTitle>Добавить Feature Request из документа</DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <input
            accept=".txt,.md,.json"
            style={{ display: "none" }}
            id="file-upload-modal"
            type="file"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
          <label htmlFor="file-upload-modal">
            <Button
              variant="contained"
              component="span"
              startIcon={<Upload />}
              disabled={isProcessing}
              size="large"
              fullWidth
            >
              Выбрать файл для анализа
            </Button>
          </label>
        </Box>

        {/* Показываем шаги всегда, если процесс начался или завершился */}
        {(isProcessing || success || error) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {isProcessing ? "Обработка документа" : "Результат обработки"}
            </Typography>
            <Stepper orientation="vertical" activeStep={currentStep}>
              {steps.map((step, index) => (
                <Step key={index} completed={step.status === "completed"}>
                  <StepLabel
                    icon={getStepIcon(step.status)}
                    error={step.status === "error"}
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                    {step.status === "processing" && (
                      <LinearProgress sx={{ mt: 1 }} />
                    )}
                    {step.status === "completed" && (
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mt: 1 }}
                      >
                        ✓ Выполнено
                      </Typography>
                    )}
                    {step.status === "error" && (
                      <Typography
                        variant="body2"
                        color="error.main"
                        sx={{ mt: 1 }}
                      >
                        ✗ Ошибка
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isProcessing}
          variant={success ? "contained" : "outlined"}
          color={success ? "success" : "primary"}
        >
          {isProcessing ? "Обработка..." : success ? "ОК" : "Закрыть"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
