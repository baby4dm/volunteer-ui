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
  Checkbox,
  FormControlLabel,
  Autocomplete,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Alert,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Inventory as AmountIcon,
  Message as MessageIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
} from "@mui/icons-material";

import { requestsApi } from "../api/requestsApi";
import { useAuth } from "../context/AuthContext";
import { UKRAINE_REGIONS } from "../data/regions";
import {
  DeliveryTypeLabels,
  type DeliveryType,
  type FulfillmentRequestDto,
} from "../types";

interface Props {
  requestId: number | null;
  requestTitle?: string;
  maxAmount?: number;
  requestDeliveryType?: DeliveryType; // 👈 Тип доставки з ЗАПИТУ
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_DATA: FulfillmentRequestDto = {
  amount: 1,
  deliveryType: "" as DeliveryType,
  comment: "",
  region: "",
  settlement: "",
  needsCourier: false, // 👈 За замовчуванням кур'єр не треба
};

export const CreateProposalModal = ({
  requestId,
  requestTitle,
  maxAmount,
  requestDeliveryType, // Отримуємо тип доставки запиту
  onClose,
  onSuccess,
}: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FulfillmentRequestDto>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useMyAddress, setUseMyAddress] = useState(false);

  // Ініціалізація форми при відкритті
  useEffect(() => {
    if (requestId && requestDeliveryType) {
      setFormData({
        ...INITIAL_DATA,
        // Якщо Самовивіз або Пошта - ми форсуємо цей тип доставки
        deliveryType: requestDeliveryType,
        // Якщо "Доставка волонтером" (VOLUNTEER_DELIVERY), теж ставимо його,
        // але далі дамо вибір: "Я сам" чи "Треба водій"
        needsCourier: false,
      });
      setErrors({});
      setUseMyAddress(false);
    }
  }, [requestId, requestDeliveryType]);

  // Автозаповнення адреси
  useEffect(() => {
    if (useMyAddress && user) {
      setFormData((prev) => ({
        ...prev,
        region: user.region || "",
        settlement: user.settlement || "",
      }));
    }
  }, [useMyAddress, user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount < 1) {
      newErrors.amount = "Кількість має бути більше 0";
    }
    if (maxAmount !== undefined && formData.amount > maxAmount) {
      newErrors.amount = `Максимум можна надати: ${maxAmount}`;
    }
    if (!formData.deliveryType) {
      newErrors.deliveryType = "Оберіть спосіб доставки";
    }
    if (!formData.region) newErrors.region = "Вкажіть область";
    if (!formData.settlement) newErrors.settlement = "Вкажіть населений пункт";

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
      alert("Помилка створення пропозиції");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "region" || name === "settlement") setUseMyAddress(false);
  };

  // Логіка перемикача "Хто везе" для VOLUNTEER_DELIVERY
  const handleCourierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const needs = event.target.value === "courier";
    setFormData((prev) => ({ ...prev, needsCourier: needs }));
  };

  return (
    <Dialog open={!!requestId} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ borderBottom: "1px solid #eee" }}>
        <Typography variant="h6" fontWeight="bold">
          Допомогти із запитом 🤝
        </Typography>
        {requestTitle && (
          <Typography variant="body2" color="text.secondary">
            {requestTitle} {maxAmount && `(Потрібно: ${maxAmount})`}
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
          {/* Локація (Тут все без змін) */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <LocationIcon color="action" fontSize="small" />
                <Typography variant="subtitle2">Звідки забирати?</Typography>
              </Box>
              {user && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useMyAddress}
                      onChange={(e) => setUseMyAddress(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="caption">
                      Використати мою адресу
                    </Typography>
                  }
                />
              )}
            </Box>
            <Box
              display="flex"
              gap={2}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              <Autocomplete
                fullWidth
                size="small"
                options={UKRAINE_REGIONS}
                value={formData.region || null}
                onChange={(_, v) => {
                  setFormData((p) => ({ ...p, region: v || "" }));
                  setUseMyAddress(false);
                }}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    label="Область"
                    error={!!errors.region}
                    helperText={errors.region}
                  />
                )}
              />
              <TextField
                label="Місто"
                name="settlement"
                fullWidth
                size="small"
                value={formData.settlement}
                onChange={handleChange}
                error={!!errors.settlement}
              />
            </Box>
          </Box>

          {/* Кількість */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AmountIcon color="action" fontSize="small" />
              <Typography variant="subtitle2">Кількість</Typography>
            </Box>
            <TextField
              name="amount"
              type="number"
              fullWidth
              size="small"
              value={formData.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{ inputProps: { min: 1, max: maxAmount } }}
            />
          </Box>

          {/* 🔥 ЛОГІКА ДОСТАВКИ 🔥 */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ShippingIcon color="action" fontSize="small" />
              <Typography variant="subtitle2">Логістика</Typography>
            </Box>

            {/* ВАРІАНТ 1: Самовивіз або Пошта (жорстко задано) */}
            {(requestDeliveryType === "SELF_PICKUP" ||
              requestDeliveryType === "POSTAL_DELIVERY") && (
              <>
                <TextField
                  disabled
                  fullWidth
                  size="small"
                  value={DeliveryTypeLabels[requestDeliveryType]}
                  helperText={
                    requestDeliveryType === "SELF_PICKUP"
                      ? "Реципієнт забере допомогу самостійно за вашою адресою."
                      : "Ви маєте відправити допомогу поштою."
                  }
                />
              </>
            )}

            {/* ВАРІАНТ 2: Потрібна доставка волонтером */}
            {requestDeliveryType === "VOLUNTEER_DELIVERY" && (
              <Box
                p={2}
                border="1px solid #e0e0e0"
                borderRadius={1}
                bgcolor="#fafafa"
              >
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  Запиту потрібна доставка. Ваші дії?
                </Typography>

                <FormControl component="fieldset">
                  <RadioGroup
                    value={formData.needsCourier ? "courier" : "self"}
                    onChange={handleCourierChange}
                  >
                    <FormControlLabel
                      value="self"
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            Я можу доставити сам 🚗
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ви привезете річ реципієнту
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 1 }}
                    />
                    <FormControlLabel
                      value="courier"
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            Не маю змоги доставити 📦
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Система створить запит на пошук водія
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {formData.needsCourier && (
                  <Alert severity="info" sx={{ mt: 2, py: 0 }}>
                    Буде створено запит у вкладці "Доставка" для пошуку
                    автоволонтера.
                  </Alert>
                )}
              </Box>
            )}
          </Box>

          <TextField
            name="comment"
            fullWidth
            multiline
            rows={2}
            placeholder="Коментар..."
            value={formData.comment}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Скасувати
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "..." : "Надіслати"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
