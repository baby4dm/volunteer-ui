import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import {
  LocalShipping as TruckIcon,
  MonitorWeight as WeightIcon,
  Straighten as SizeIcon,
  CalendarToday as DateIcon,
  ArrowRightAlt as ArrowIcon,
  Circle as CircleIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

import { RequestPriorityLabels } from "../types";
import type { DeliveryPreviewResponse } from "../types";

interface Props {
  item: DeliveryPreviewResponse;
  variant: "AVAILABLE" | "ACTIVE" | "ARCHIVE";
  onAction?: (id: number) => void;
}

export const DeliveryCard = ({ item, variant, onAction }: Props) => {
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

  const isActive = variant === "ACTIVE";

  const buttonStyles = {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    px: 3,
    boxShadow: 2,
    "&:hover": {
      boxShadow: 4,
    },
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: isActive ? "primary.light" : "grey.200",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Chip
            label={RequestPriorityLabels[item.priority] || item.priority}
            color={getPriorityColor(item.priority) as any}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
              borderWidth: "1px",
            }}
          />
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            color="text.secondary"
          >
            <DateIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
              До: {new Date(item.validUntil).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          px={1}
        >
          <Box display="flex" flexDirection="column" gap={0.5} flex={1}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              color="text.secondary"
            >
              <CircleIcon sx={{ fontSize: 10, color: "primary.main" }} />
              <Typography variant="caption" fontWeight={500}>
                Звідки
              </Typography>
            </Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              lineHeight={1.2}
            >
              {item.fromSettlement}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {item.fromRegion}
            </Typography>
          </Box>

          <Box
            px={2}
            color="primary.main"
            display="flex"
            alignItems="center"
            sx={{ opacity: 0.6 }}
          >
            <ArrowIcon sx={{ fontSize: 30 }} />
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            gap={0.5}
            flex={1}
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              color="text.secondary"
            >
              <Typography variant="caption" fontWeight={500}>
                Куди
              </Typography>
              <LocationIcon sx={{ fontSize: 14, color: "error.main" }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              align="right"
              lineHeight={1.2}
            >
              {item.toSettlement}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              align="right"
            >
              {item.toRegion}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "grey.50",
            borderRadius: 2,
            p: 1.5,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <WeightIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                lineHeight={1}
              >
                Вага
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {item.weight} кг
              </Typography>
            </Box>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 24, alignSelf: "center", borderColor: "grey.300" }}
          />

          <Box display="flex" alignItems="center" gap={1}>
            <SizeIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Box>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                lineHeight={1}
              >
                Розмір (см)
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {item.length} × {item.width} × {item.height}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      {onAction && variant !== "ARCHIVE" && (
        <CardActions
          sx={{ justifyContent: "flex-end", px: 2.5, pb: 2.5, pt: 0 }}
        >
          {variant === "AVAILABLE" && (
            <Button
              variant="contained"
              color="primary"
              disableElevation
              size="medium"
              onClick={() => onAction(item.id)}
              sx={buttonStyles}
            >
              Взяти замовлення
            </Button>
          )}
          {variant === "ACTIVE" && (
            <Button
              variant="contained"
              color="success"
              disableElevation
              size="medium"
              startIcon={<TruckIcon />}
              onClick={() => onAction(item.id)}
              sx={buttonStyles}
            >
              Підтвердити доставку
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};
