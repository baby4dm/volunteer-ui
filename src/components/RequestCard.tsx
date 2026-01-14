import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  LinearProgress,
  CardActionArea,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  PriorityHigh as PriorityIcon,
  Category as CategoryIcon,
  Event as DateIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DoneIcon,
} from "@mui/icons-material";

import type { HelpRequestPreviewResponse } from "../types";

import {
  RequestStatusLabels,
  RequestPriorityLabels,
  HelpCategoryLabels,
  DeliveryTypeLabels,
} from "../types";

interface Props {
  req: HelpRequestPreviewResponse;
  onDelete: (id: number) => void;
  onComplete?: (id: number) => void;
  onClick: (id: number) => void;
}

export const RequestCard = ({ req, onDelete, onComplete, onClick }: Props) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "CREATED":
        return "primary";
      case "CANCELED":
        return "default";
      default:
        return "default";
    }
  };

  const isActive = req.status === "CREATED" || req.status === "IN_PROGRESS";

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 2,
        boxShadow: 1,
        border: "1px solid #e0e0e0",
        position: "relative",
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
          height: "100%",
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2, width: "100%" }}>
          <Box mb={1.5}>
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              <Chip
                icon={<PriorityIcon style={{ fontSize: 16 }} />}
                label={RequestPriorityLabels[req.priority] || req.priority}
                color={getPriorityColor(req.priority) as any}
                size="small"
                variant="filled"
                sx={{ fontWeight: "bold", borderRadius: 1.5 }}
              />

              <Chip
                label={RequestStatusLabels[req.status] || req.status}
                color={getStatusColor(req.status) as any}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500, border: "1px solid" }}
              />

              <Chip
                icon={<CategoryIcon style={{ fontSize: 14, opacity: 0.7 }} />}
                label={HelpCategoryLabels[req.category]}
                size="small"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.dark",
                  fontWeight: 500,
                  border: "none",
                  "& .MuiChip-icon": { color: "primary.main" },
                }}
              />
            </Box>
          </Box>

          <Typography variant="h6" fontWeight="bold" lineHeight={1.3} mb={1}>
            {req.title}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              color="text.secondary"
            >
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="caption" fontWeight={500}>
                {req.settlement}, {req.region}
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              color="text.secondary"
            >
              <ShippingIcon fontSize="small" color="action" />
              <Typography variant="caption" fontWeight={500}>
                {DeliveryTypeLabels[req.deliveryType] || "Не вказано"}
              </Typography>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              color="text.secondary"
            >
              <DateIcon fontSize="small" color="action" />
              <Typography variant="caption" fontWeight={500}>
                До: {new Date(req.validUntil).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box flexGrow={1} onClick={(e) => e.stopPropagation()}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Зібрано: <b>{currentAmount}</b> / {req.amount}
              </Typography>
              <Typography
                variant="caption"
                fontWeight="bold"
                color={displayPercent >= 100 ? "success.main" : "text.primary"}
              >
                {percent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={displayPercent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              }}
              color={displayPercent >= 100 ? "success" : "primary"}
            />
          </Box>
        </CardContent>
      </CardActionArea>

      <CardActions
        sx={{
          position: "absolute",
          right: 0,
          top: 0,
          p: 1,
          display: "flex",
          gap: 0.5,
          zIndex: 2,
        }}
      >
        {isActive && onComplete && (
          <Tooltip title="Завершити збір">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(req.id);
              }}
              sx={{
                color: "success.main",
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
                border: "1px solid",
                borderColor: "success.light",
                "&:hover": {
                  bgcolor: "success.main",
                  color: "white",
                  borderColor: "success.main",
                },
              }}
            >
              <DoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Видалити">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(req.id);
            }}
            sx={{
              color: "text.disabled",
              "&:hover": { color: "error.main", bgcolor: "error.lighter" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
