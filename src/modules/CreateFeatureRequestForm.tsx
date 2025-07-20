import React, { useState, useEffect, useRef } from "react";
import { Paper, Typography, Button, Box, TextField } from "@mui/material";
import { Add } from "@mui/icons-material";
import featureRequestStore from "../stores/featureRequestStore";
import type { FeatureRequestResponseDto } from "../api/nswag-api-client";
import {
  CreateFeatureRequestDto,
  UpdateFeatureRequestDto,
} from "../api/nswag-api-client";

interface FullFeaturedTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
}

const FullFeaturedTextarea: React.FC<FullFeaturedTextareaProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  minRows = 3,
  maxRows = 10,
  maxLength = 5000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Авто-ресайз при изменении контента
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(
        getComputedStyle(textareaRef.current).lineHeight
      );

      // Рассчитываем количество строк
      const rows = Math.floor(scrollHeight / lineHeight);

      if (rows > maxRows) {
        textareaRef.current.style.overflowY = "scroll";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [value, maxRows]);

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        inputRef={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        fullWidth
        variant="outlined"
        label={label}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        // Стилизация
        sx={{
          "& .MuiOutlinedInput-root": {
            transition: "all 0.3s ease",
            "& textarea": {
              resize: "vertical",
              minHeight: `${minRows * 24}px`,
              maxHeight: `${maxRows * 24}px`,
            },
          },
        }}
      />

      <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
        {value.length} / {maxLength} символов
      </Typography>
    </Box>
  );
};

interface CreateFeatureRequestFormProps {
  initialData?: FeatureRequestResponseDto;
  onSuccess?: () => void;
}

const CreateFeatureRequestForm: React.FC<CreateFeatureRequestFormProps> = ({
  initialData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    when: "",
    want: "",
    how: "",
    soThat: "",
    featureRequests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        when: initialData.when || "",
        want: initialData.want || "",
        how: initialData.how || "",
        soThat: initialData.soThat || "",
        featureRequests: initialData.featureRequests || "",
      });
    }
  }, [initialData]);

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return `${name} обязательно для заполнения`;
    }
    if (value.length > 5000) {
      return `${name} не может быть длиннее 5000 символов`;
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Для создания - все поля обязательные
    if (!initialData) {
      Object.keys(formData).forEach((key) => {
        const error = validateField(
          key,
          formData[key as keyof typeof formData]
        );
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      });
    } else {
      // Для обновления - все поля опциональные, валидируем только заполненные
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (value.trim()) {
          // Проверяем только длину для заполненных полей
          if (value.length > 5000) {
            newErrors[key] = `${key} не может быть длиннее 5000 символов`;
            isValid = false;
          }
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    const error = validateField(
      field,
      formData[field as keyof typeof formData]
    );
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (initialData) {
        // Update existing feature request
        const updateDto = new UpdateFeatureRequestDto();

        // Теперь все поля опциональные, можно безопасно присваивать
        updateDto.when = formData.when;
        updateDto.want = formData.want;
        updateDto.how = formData.how;
        updateDto.soThat = formData.soThat;
        updateDto.featureRequests = formData.featureRequests;

        await featureRequestStore.updateFeatureRequest(
          initialData.id.toString(),
          updateDto
        );

        // Обновляем данные в таблице
        await featureRequestStore.getFeatureRequests();

        // Вызываем callback с обновленными данными
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Create new feature request
        const createDto = new CreateFeatureRequestDto();
        createDto.customer = ""; // Empty customer field as requested
        createDto.when = formData.when;
        createDto.want = formData.want;
        createDto.how = formData.how;
        createDto.soThat = formData.soThat;
        createDto.featureRequests = formData.featureRequests;

        await featureRequestStore.createFeatureRequest(createDto);

        // Обновляем данные в таблице
        await featureRequestStore.getFeatureRequests();
      }

      // Reset form after successful save
      if (!initialData) {
        setFormData({
          when: "",
          want: "",
          how: "",
          soThat: "",
          featureRequests: "",
        });
        setTouched({});
        setErrors({});
      }

      onSuccess?.();
    } catch (error) {
      console.error("❌ Error saving feature request:", error);
      // You can add error handling UI here
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, width: "100%", maxWidth: "none" }}>
      <Typography variant="h6" gutterBottom>
        {initialData
          ? "Редактировать Feature Request"
          : "Создать новый Feature Request"}
      </Typography>

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}
      >
        <FullFeaturedTextarea
          label="When (контекст/триггер)"
          value={formData.when}
          onChange={(value) => handleFormChange("when", value)}
          onBlur={() => handleFieldBlur("when")}
          error={touched.when && !!errors.when}
          helperText={touched.when && errors.when ? errors.when : undefined}
          placeholder="Опишите контекст или триггер ситуации..."
          minRows={3}
          maxRows={6}
        />

        <FullFeaturedTextarea
          label="Want (желаемый результат)"
          value={formData.want}
          onChange={(value) => handleFormChange("want", value)}
          onBlur={() => handleFieldBlur("want")}
          error={touched.want && !!errors.want}
          helperText={touched.want && errors.want ? errors.want : undefined}
          placeholder="Опишите что хочет получить клиент..."
          minRows={3}
          maxRows={6}
        />

        <FullFeaturedTextarea
          label="How (критерии успеха)"
          value={formData.how}
          onChange={(value) => handleFormChange("how", value)}
          onBlur={() => handleFieldBlur("how")}
          error={touched.how && !!errors.how}
          helperText={touched.how && errors.how ? errors.how : undefined}
          placeholder="Опишите как это должно работать..."
          minRows={3}
          maxRows={6}
        />

        <FullFeaturedTextarea
          label="So That (глобальная цель)"
          value={formData.soThat}
          onChange={(value) => handleFormChange("soThat", value)}
          onBlur={() => handleFieldBlur("soThat")}
          error={touched.soThat && !!errors.soThat}
          helperText={
            touched.soThat && errors.soThat ? errors.soThat : undefined
          }
          placeholder="Опишите для чего это нужно..."
          minRows={3}
          maxRows={6}
        />

        <FullFeaturedTextarea
          label="Feature Requests"
          value={formData.featureRequests}
          onChange={(value) => handleFormChange("featureRequests", value)}
          onBlur={() => handleFieldBlur("featureRequests")}
          error={touched.featureRequests && !!errors.featureRequests}
          helperText={
            touched.featureRequests && errors.featureRequests
              ? errors.featureRequests
              : undefined
          }
          placeholder="Опишите конкретные feature requests..."
          minRows={4}
          maxRows={8}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleSave}
          size="large"
        >
          {initialData ? "Обновить" : "Сохранить"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateFeatureRequestForm;
