import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  RadioGroup,
  Radio,
  FormControl,
  Alert,
  Grid,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Inventory as AmountIcon,
  LocationOn as LocationIcon,
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
  requestDeliveryType?: DeliveryType;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_DATA: FulfillmentRequestDto = {
  amount: 1,
  comment: "",
  region: "",
  settlement: "",
  needsCourier: false,
};

interface DeliveryData {
  weight: string;
  length: string;
  width: string;
  height: string;
  description: string;
}

const INITIAL_DELIVERY_DATA: DeliveryData = {
  weight: "",
  length: "",
  width: "",
  height: "",
  description: "",
};

export const CreateProposalModal = ({
  requestId,
  requestTitle,
  maxAmount,
  requestDeliveryType,
  onClose,
  onSuccess,
}: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [createdFulfillmentId, setCreatedFulfillmentId] = useState<
    number | null
  >(null);

  const [formData, setFormData] = useState<FulfillmentRequestDto>(INITIAL_DATA);
  const [deliveryData, setDeliveryData] = useState<DeliveryData>(
    INITIAL_DELIVERY_DATA
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useMyAddress, setUseMyAddress] = useState(false);

  useEffect(() => {
    if (requestId && requestDeliveryType) {
      setFormData({
        ...INITIAL_DATA,
        needsCourier: false,
      });
      setDeliveryData(INITIAL_DELIVERY_DATA);
      setErrors({});
      setUseMyAddress(false);
      setStep(1);
      setCreatedFulfillmentId(null);
    }
  }, [requestId, requestDeliveryType]);

  useEffect(() => {
    if (useMyAddress && user) {
      setFormData((prev) => ({
        ...prev,
        region: user.region || "",
        settlement: user.settlement || "",
      }));
    }
  }, [useMyAddress, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "region" || name === "settlement") setUseMyAddress(false);
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCourierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const needs = event.target.value === "courier";
    setFormData((prev) => ({ ...prev, needsCourier: needs }));
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || formData.amount < 1)
      newErrors.amount = "Вкажіть кількість";
    if (maxAmount !== undefined && formData.amount > maxAmount)
      newErrors.amount = `Максимум: ${maxAmount}`;
    if (!formData.region) newErrors.region = "Вкажіть область";
    if (!formData.settlement) newErrors.settlement = "Вкажіть місто";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!deliveryData.weight || Number(deliveryData.weight) <= 0)
      newErrors.weight = "Вкажіть вагу (> 0)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async () => {
    if (!requestId) return;
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const response = await requestsApi.createOffer(requestId, formData);

      if (!formData.needsCourier) {
        onSuccess();
        onClose();
        return;
      }

      if (response && response.id) {
        setCreatedFulfillmentId(response.id);
        setStep(2);
      } else {
        alert("Помилка: не вдалося отримати ID заявки. Спробуйте ще раз.");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
      alert("Помилка створення пропозиції");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!createdFulfillmentId) return;
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const payload = {
        fulfillmentId: createdFulfillmentId,
        weight: Number(deliveryData.weight),
        length: deliveryData.length ? Number(deliveryData.length) : null,
        width: deliveryData.width ? Number(deliveryData.width) : null,
        height: deliveryData.height ? Number(deliveryData.height) : null,
        description: deliveryData.description,
      };

      await requestsApi.createDeliveryRequest(payload);

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert(
        "Помилка створення запиту на доставку. Пропозицію створено, але без деталей доставки."
      );
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!requestId} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ borderBottom: "1px solid #eee" }}>
        <Box display="flex" alignItems="center" gap={1}>
          {step === 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Крок 2/2
            </Typography>
          )}
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {step === 1 ? "Допомогти із запитом 🤝" : "Деталі для водія 🚚"}
            </Typography>
            {step === 1 && requestTitle && (
              <Typography variant="body2" color="text.secondary">
                {requestTitle} {maxAmount && `(Потрібно: ${maxAmount})`}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          component="form"
          display="flex"
          flexDirection="column"
          gap={3}
          mt={1}
        >
          {step === 1 && (
            <>
              <Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography variant="subtitle2">
                      Звідки забирати?
                    </Typography>
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

              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ShippingIcon color="action" fontSize="small" />
                  <Typography variant="subtitle2">Логістика</Typography>
                </Box>

                {(requestDeliveryType === "SELF_PICKUP" ||
                  requestDeliveryType === "POSTAL_DELIVERY") && (
                  <TextField
                    disabled
                    fullWidth
                    size="small"
                    value={DeliveryTypeLabels[requestDeliveryType]}
                    helperText="Спосіб доставки визначено реципієнтом."
                  />
                )}

                {requestDeliveryType === "VOLUNTEER_DELIVERY" && (
                  <Box
                    p={2}
                    border="1px solid #e0e0e0"
                    borderRadius={1}
                    bgcolor="#fafafa"
                  >
                    <Typography variant="body2" fontWeight="bold" mb={1}>
                      Як передамо речі?
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={formData.needsCourier ? "courier" : "self"}
                        onChange={handleCourierChange}
                      >
                        <FormControlLabel
                          value="self"
                          control={<Radio size="small" />}
                          label="Я можу доставити сам 🚗"
                        />
                        <FormControlLabel
                          value="courier"
                          control={<Radio size="small" />}
                          label="Мені потрібен водій 📦"
                        />
                      </RadioGroup>
                    </FormControl>

                    {formData.needsCourier && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Натисніть "Далі", щоб вказати параметри вантажу для
                        водія.
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
                placeholder="Коментар до заявки..."
                value={formData.comment}
                onChange={handleChange}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Alert severity="success" sx={{ mb: 1 }}>
                Пропозицію створено! Тепер вкажіть деталі для пошуку водія.
              </Alert>

              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Фізичні параметри
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Вага"
                      name="weight"
                      type="number"
                      size="small"
                      fullWidth
                      autoFocus
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">кг</InputAdornment>
                        ),
                      }}
                      value={deliveryData.weight}
                      onChange={handleDeliveryChange}
                      error={!!errors.weight}
                      helperText={errors.weight}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Довжина"
                      name="length"
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">см</InputAdornment>
                        ),
                      }}
                      value={deliveryData.length}
                      onChange={handleDeliveryChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Ширина"
                      name="width"
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">см</InputAdornment>
                        ),
                      }}
                      value={deliveryData.width}
                      onChange={handleDeliveryChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Висота"
                      name="height"
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">см</InputAdornment>
                        ),
                      }}
                      value={deliveryData.height}
                      onChange={handleDeliveryChange}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Опис вантажу
                </Typography>
                <TextField
                  name="description"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Наприклад: Крихке, скло, потрібен порожній багажник..."
                  value={deliveryData.description}
                  onChange={handleDeliveryChange}
                  helperText="Водій побачить це в деталях замовлення"
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {step === 1 && (
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Скасувати
          </Button>
        )}

        <Button
          onClick={step === 1 ? handleStep1Submit : handleStep2Submit}
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : step === 1 && formData.needsCourier ? (
            "Далі"
          ) : (
            "Надіслати"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
