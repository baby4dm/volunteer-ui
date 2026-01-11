import {
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Box,
  Chip,
  Typography,
  LinearProgress,
  Button,
  alpha,
} from "@mui/material";
import {
  PriorityHigh as PriorityIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  LocalShipping as ShippingIcon,
  Event as DateIcon,
  Handshake as HandshakeIcon,
} from "@mui/icons-material";

import type { HelpRequestPreviewResponse } from "../types";
import {
  RequestPriorityLabels,
  HelpCategoryLabels,
  RequestStatusLabels,
  DeliveryTypeLabels,
} from "../types";

interface Props {
  req: HelpRequestPreviewResponse;
  onHelp: (id: number) => void;
  onClick: (id: number) => void;
}

export const VolunteerRequestCard = ({ req, onHelp, onClick }: Props) => {
  const currentAmount = req.receivedAmount || 0;
  const percent =
    req.amount > 0 ? Math.round((currentAmount / req.amount) * 100) : 0;
  const displayPercent = Math.min(100, Math.max(0, percent));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 2,
        boxShadow: 1,
        border: "1px solid #e0e0e0",
        transition: "0.2s",
        "&:hover": { borderColor: "primary.main", boxShadow: 3 },
      }}
    >
      <CardActionArea
        onClick={() => onClick(req.id)}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "stretch",
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box mb={1.5} display="flex" gap={1} flexWrap="wrap">
            <Chip
              icon={<PriorityIcon style={{ fontSize: 16 }} />}
              label={RequestPriorityLabels[req.priority]}
              color={getPriorityColor(req.priority) as any}
              size="small"
              variant="filled"
              sx={{ borderRadius: 1.5, fontWeight: "bold" }}
            />

            <Chip
              label={HelpCategoryLabels[req.category]}
              size="small"
              icon={<CategoryIcon style={{ fontSize: 14 }} />}
              sx={{
                bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                color: "primary.dark",
                fontWeight: 500,
              }}
            />

            <Chip
              label={RequestStatusLabels[req.status]}
              variant="outlined"
              size="small"
            />
          </Box>

          <Typography variant="h6" fontWeight="bold" mb={1}>
            {req.title}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Box
              display="flex"
              gap={0.5}
              alignItems="center"
              color="text.secondary"
            >
              <LocationIcon fontSize="small" />{" "}
              <Typography variant="caption">
                {req.settlement}, {req.region}
              </Typography>
            </Box>
            <Box
              display="flex"
              gap={0.5}
              alignItems="center"
              color="text.secondary"
            >
              <ShippingIcon fontSize="small" />{" "}
              <Typography variant="caption">
                {DeliveryTypeLabels[req.deliveryType] || "Не вказано"}
              </Typography>
            </Box>
            <Box
              display="flex"
              gap={0.5}
              alignItems="center"
              color="text.secondary"
            >
              <DateIcon fontSize="small" />{" "}
              <Typography variant="caption">
                До: {new Date(req.validUntil).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Зібрано: {currentAmount} / {req.amount}
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                {percent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={displayPercent}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>

      <CardActions
        sx={{
          borderTop: "1px solid #f0f0f0",
          p: 1,
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<HandshakeIcon />}
          onClick={() => onHelp(req.id)}
          disabled={req.status !== "CREATED" && req.status !== "IN_PROGRESS"}
        >
          Допомогти
        </Button>
      </CardActions>
    </Card>
  );
};
