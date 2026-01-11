import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Inventory as AmountIcon,
  Message as MessageIcon,
} from "@mui/icons-material";

import { requestsApi } from "../api/requestsApi";
import {
  DeliveryTypeLabels,
  type DeliveryType,
  type FulfillmentRequestDto,
} from "../types";

interface Props {
  requestId: number | null;
  requestTitle?: string;
  maxAmount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_DATA: FulfillmentRequestDto = {
  amount: 1,
  deliveryType: "" as DeliveryType,
  comment: "",
};

export const CreateProposalModal = ({
  requestId,
  requestTitle,
  maxAmount,
  onClose,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FulfillmentRequestDto>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (requestId) {
      setFormData(INITIAL_DATA);
      setErrors({});
    }
  }, [requestId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount < 1) {
      newErrors.amount = "Кількість має бути більше 0";
    }

    if (maxAmount && formData.amount > maxAmount) {
      newErrors.amount = `Максимум потрібно: ${maxAmount}`;
    }

    if (!formData.deliveryType) {
      newErrors.deliveryType = "Оберіть спосіб доставки";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!requestId) return;
    if (!validate()) return;

    setLoading(true);
    try {
      await requestsApi.createOffer(requestId, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Не вдалося відправити пропозицію. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <Dialog open={!!requestId} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ borderBottom: "1px solid #eee" }}>
        <Typography variant="h6" fontWeight="bold">
          Запропонувати допомогу 🤝
        </Typography>
        {requestTitle && (
          <Typography variant="body2" color="text.secondary">
            Запит: {requestTitle}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          component="form"
          display="flex"
          flexDirection="column"
          gap={3}
          mt={1}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AmountIcon color="action" fontSize="small" />
              <Typography variant="subtitle2">
                Скільки ви можете надати?
              </Typography>
            </Box>
            <TextField
              name="amount"
              type="number"
              fullWidth
              size="small"
              placeholder="Введіть кількість"
              value={formData.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>

          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ShippingIcon color="action" fontSize="small" />
              <Typography variant="subtitle2">Спосіб доставки</Typography>
            </Box>
            <TextField
              select
              name="deliveryType"
              fullWidth
              size="small"
              value={formData.deliveryType}
              onChange={handleChange}
              error={!!errors.deliveryType}
              helperText={errors.deliveryType}
              label="Оберіть варіант"
            >
              {Object.entries(DeliveryTypeLabels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <MessageIcon color="action" fontSize="small" />
              <Typography variant="subtitle2">
                Коментар (необов'язково)
              </Typography>
            </Box>
            <TextField
              name="comment"
              fullWidth
              multiline
              rows={3}
              placeholder="Напишіть деталі, наприклад: 'Можу відправити завтра Новою Поштою'..."
              value={formData.comment}
              onChange={handleChange}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
        <Button onClick={onClose} color="inherit" size="large">
          Скасувати
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? "Відправка..." : "Надіслати пропозицію"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
