import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { requestsApi } from "../api/requestsApi";
import type { HelpRequestDto, HelpCategory, DeliveryType } from "../types";

import {
  HelpCategoryLabels,
  DeliveryTypeLabels,
  RequestPriorityLabels,
} from "../types";
import { UKRAINE_REGIONS } from "../data/regions";
import { useAuth } from "../context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_DATA: HelpRequestDto = {
  title: "",
  description: "",
  category: "" as HelpCategory,
  region: "",
  settlement: "",
  deliveryType: "" as DeliveryType,
  contactPhone: "+380",
  amount: 1,
  validUntil: "",
  priority: "MEDIUM",
  photoUrl: "",
};

export const CreateRequestModal = ({ open, onClose, onSuccess }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HelpRequestDto>(INITIAL_DATA);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setFormData((prev) => ({
        ...INITIAL_DATA,
        region: user?.region || "",
        settlement: user?.settlement || "",
        contactPhone: user?.phoneNumber || "+380",
      }));
    }
  }, [open, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Заголовок обов'язковий";
    if (!formData.description.trim())
      newErrors.description = "Опис обов'язковий";
    if (!formData.category) newErrors.category = "Оберіть категорію";
    if (!formData.region) newErrors.region = "Оберіть область";
    if (!formData.settlement.trim())
      newErrors.settlement = "Вкажіть місто/село";
    if (!formData.deliveryType) newErrors.deliveryType = "Оберіть тип доставки";
    if (!formData.validUntil)
      newErrors.validUntil = "Вкажіть дату актуальності";

    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone = "Формат: +380XXXXXXXXX";
    }

    if (formData.amount < 1) newErrors.amount = "Мінімум 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await requestsApi.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Не вдалося створити запит. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Створити запит про допомогу
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Заголовок (напр. Ліки для літньої людини)"
              name="title"
              fullWidth
              required
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Категорія допомоги"
              name="category"
              fullWidth
              required
              value={formData.category}
              onChange={handleChange}
              error={!!errors.category}
              helperText={errors.category}
            >
              {Object.entries(HelpCategoryLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Терміновість"
              name="priority"
              fullWidth
              required
              value={formData.priority}
              onChange={handleChange}
            >
              {Object.entries(RequestPriorityLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              label="Детальний опис ситуації"
              name="description"
              fullWidth
              multiline
              rows={3}
              required
              placeholder="Опишіть, що сталося і що саме потрібно..."
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={UKRAINE_REGIONS}
              value={formData.region || null}
              onChange={(_, newValue) => {
                setFormData((prev) => ({ ...prev, region: newValue || "" }));
                if (newValue) setErrors((prev) => ({ ...prev, region: "" }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Область"
                  required
                  error={!!errors.region}
                  helperText={errors.region}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Населений пункт"
              name="settlement"
              fullWidth
              required
              placeholder="напр. Харків"
              value={formData.settlement}
              onChange={handleChange}
              error={!!errors.settlement}
              helperText={errors.settlement}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Необхідна кількість (шт/кг/наборів)"
              name="amount"
              type="number"
              fullWidth
              required
              InputProps={{ inputProps: { min: 1 } }}
              value={formData.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Актуально до"
              name="validUntil"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split("T")[0] }}
              value={formData.validUntil}
              onChange={handleChange}
              error={!!errors.validUntil}
              helperText={errors.validUntil}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Бажаний спосіб отримання"
              name="deliveryType"
              fullWidth
              required
              value={formData.deliveryType}
              onChange={handleChange}
              error={!!errors.deliveryType}
              helperText={errors.deliveryType}
            >
              {Object.entries(DeliveryTypeLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Контактний телефон"
              name="contactPhone"
              fullWidth
              required
              placeholder="+380..."
              value={formData.contactPhone}
              onChange={handleChange}
              error={!!errors.contactPhone}
              helperText={errors.contactPhone}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" size="large">
          Скасувати
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Створити"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
