import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Divider,
  LinearProgress,
  Grid,
  Avatar,
  Paper,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalShipping as ShippingIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";

import { requestsApi } from "../api/requestsApi";
import {
  RequestStatusLabels,
  HelpCategoryLabels,
  RequestPriorityLabels,
  DeliveryTypeLabels,
  type HelpRequestResponse,
} from "../types";

interface Props {
  requestId: number | null;
  onClose: () => void;
}

export const RequestDetailsModal = ({ requestId, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HelpRequestResponse | null>(null);

  useEffect(() => {
    if (requestId) {
      setLoading(true);
      requestsApi
        .getById(requestId)
        .then((res) => setData(res))
        .catch((err) => console.error("Помилка завантаження деталей:", err))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [requestId]);

  if (!requestId) return null;

  const received = data?.receivedAmount || 0;
  const total = data?.amount || 1;
  const percent = Math.min(100, Math.round((received / total) * 100));

  return (
    <Dialog open={!!requestId} onClose={onClose} maxWidth="md" fullWidth>
      {loading || !data ? (
        <Box p={5} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {data.title}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip
                    label={RequestStatusLabels[data.status]}
                    color={data.status === "COMPLETED" ? "success" : "primary"}
                    size="small"
                  />
                  <Chip
                    label={RequestPriorityLabels[data.priority]}
                    color={data.priority === "CRITICAL" ? "error" : "default"}
                    variant={
                      data.priority === "CRITICAL" ? "filled" : "outlined"
                    }
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                #{data.id}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                {data.photoUrl && (
                  <Box
                    mb={3}
                    borderRadius={2}
                    overflow="hidden"
                    border="1px solid #eee"
                  >
                    <img
                      src={data.photoUrl}
                      alt="Фото запиту"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        maxHeight: "300px",
                      }}
                    />
                  </Box>
                )}

                <Box mb={3}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Детальний опис
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {data.description}
                  </Typography>
                </Box>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f9fafb" }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2">Збір допомоги</Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color={percent === 100 ? "success.main" : "primary"}
                    >
                      {percent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{ height: 10, borderRadius: 5 }}
                    color={percent === 100 ? "success" : "primary"}
                  />
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Зібрано: <b>{received}</b>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ціль: <b>{total}</b>
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    p={2}
                    bgcolor="#eef2ff"
                    borderRadius={2}
                  >
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {data.authorName ? data.authorName[0] : <PersonIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {data.authorName || "Анонімно"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Автор запиту
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <InfoRow
                    icon={<LocationIcon color="action" />}
                    label="Локація"
                    value={`${data.settlement}, ${data.region}`}
                  />

                  <InfoRow
                    icon={<PhoneIcon color="action" />}
                    label="Контакт"
                    value={data.contactPhone}
                  />

                  <InfoRow
                    icon={<ShippingIcon color="action" />}
                    label="Доставка"
                    value={
                      DeliveryTypeLabels[data.deliveryType] || data.deliveryType
                    }
                  />

                  <InfoRow
                    icon={<CalendarIcon color="action" />}
                    label="Актуально до"
                    value={new Date(data.validUntil).toLocaleDateString()}
                  />

                  <InfoRow
                    icon={<TimeIcon color="action" />}
                    label="Створено"
                    value={new Date(data.createdAt).toLocaleDateString()}
                  />

                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Категорія
                    </Typography>
                    <Box mt={0.5}>
                      <Chip label={HelpCategoryLabels[data.category]} />
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
            <Button onClick={onClose} size="large" color="inherit">
              Закрити
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

import { Stack } from "@mui/material";

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Box display="flex" alignItems="center" gap={1.5}>
    {icon}
    <Box>
      <Typography
        variant="caption"
        display="block"
        color="text.secondary"
        lineHeight={1}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Box>
);
