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
        borderRadius: 3, // Закруглені кути як у новому стилі
        boxShadow: 1,
        border: "1px solid",
        borderColor: "grey.200",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
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
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          {/* Header Tags */}
          <Box mb={2} display="flex" gap={1} flexWrap="wrap">
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
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            />

            <Chip
              label={RequestStatusLabels[req.status]}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 1.5, fontWeight: 500 }}
            />
          </Box>

          <Typography variant="h6" fontWeight="bold" mb={1.5} lineHeight={1.3}>
            {req.title}
          </Typography>

          {/* Info Row */}
          <Box display="flex" flexWrap="wrap" gap={2} mb={2.5}>
            <Box
              display="flex"
              gap={0.5}
              alignItems="center"
              color="text.secondary"
            >
              <LocationIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={500}>
                {req.settlement}, {req.region}
              </Typography>
            </Box>
            <Box
              display="flex"
              gap={0.5}
              alignItems="center"
              color="text.secondary"
            >
              <ShippingIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={500}>
                {DeliveryTypeLabels[req.deliveryType] || "Не вказано"}
              </Typography>
            </Box>
            <Box
              display="flex"
              gap={0.5}
              alignItems="center"
              color="text.secondary"
            >
              <DateIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={500}>
                До: {new Date(req.validUntil).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Зібрано: <b>{currentAmount}</b> з {req.amount}
              </Typography>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="primary.main"
              >
                {percent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={displayPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "grey.100",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>

      {/* Action Button */}
      <CardActions
        sx={{
          borderTop: "1px solid",
          borderColor: "grey.100",
          p: 2,
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          disableElevation
          size="medium" // Збільшений розмір
          startIcon={<HandshakeIcon />}
          onClick={() => onHelp(req.id)}
          disabled={req.status !== "CREATED" && req.status !== "IN_PROGRESS"}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            boxShadow: 2, // Легка тінь
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          Допомогти
        </Button>
      </CardActions>
    </Card>
  );
};
