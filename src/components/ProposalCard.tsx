import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  Avatar,
  Divider,
  Paper,
  Link, // 👈 Додаємо імпорт Link
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  LocalShipping as ShippingIcon,
  Inventory as AmountIcon,
  Message as MessageIcon,
  Launch as LaunchIcon, // Іконка для переходу
} from "@mui/icons-material";

import {
  FulfillmentStatusLabels,
  DeliveryTypeLabels,
  type FulfillmentResponse,
} from "../types";

export const ProposalCard = ({
  prop,
  onApprove,
  onReject,
  onRequestClick,
}: {
  prop: FulfillmentResponse;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onRequestClick: (requestId: number) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
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
        borderLeft:
          prop.status === "PENDING" ? "4px solid #ed6c02" : "1px solid #e0e0e0",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box display="flex" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {prop.volunteerName ? prop.volunteerName[0] : "?"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {prop.volunteerName}
              </Typography>

              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Відгук на:
                </Typography>
                <Link
                  component="button"
                  variant="caption"
                  fontWeight="bold"
                  underline="hover"
                  onClick={() => onRequestClick(prop.requestId)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {prop.requestTitle} <LaunchIcon sx={{ fontSize: 12 }} />
                </Link>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
              >
                {new Date(prop.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={FulfillmentStatusLabels[prop.status]}
            color={getStatusColor(prop.status) as any}
            size="small"
            variant={prop.status === "APPROVED" ? "filled" : "outlined"}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <AmountIcon fontSize="small" color="action" />
            <Typography variant="body2">
              Пропонує кількість: <b>{prop.amount}</b>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <ShippingIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {DeliveryTypeLabels[prop.deliveryType]}
            </Typography>
          </Box>

          {prop.volunteerPhone && (
            <Box display="flex" alignItems="center" gap={1}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2">{prop.volunteerPhone}</Typography>
            </Box>
          )}

          {prop.comment && (
            <Paper
              variant="outlined"
              sx={{ p: 1.5, bgcolor: "#f9fafb", mt: 1 }}
            >
              <Box display="flex" gap={1} mb={0.5}>
                <MessageIcon
                  fontSize="small"
                  color="disabled"
                  sx={{ width: 16, height: 16 }}
                />
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  Коментар:
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                "{prop.comment}"
              </Typography>
            </Paper>
          )}
        </Box>
      </CardContent>

      {prop.status === "PENDING" && (
        <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, pt: 0 }}>
          <Button
            size="small"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => onReject(prop.id)}
          >
            Відхилити
          </Button>
          <Button
            variant="contained"
            size="small"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => onApprove(prop.id)}
          >
            Прийняти
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
