import {
  Card,
  CardContent,
  Box,
  Chip,
  Typography,
  Paper,
  alpha,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Event as DateIcon,
  Handshake as HandshakeIcon,
} from "@mui/icons-material";

import type { VolunteerContributionResponse } from "../types";
import { FulfillmentStatusLabels, HelpCategoryLabels } from "../types";

interface Props {
  contrib: VolunteerContributionResponse;
}

export const ContributionCard = ({ contrib }: Props) => {
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
        border: "1px solid #e0e0e0",
        transition: "0.2s",
        "&:hover": { borderColor: "primary.main", boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          mb={1.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Chip
            label={FulfillmentStatusLabels[contrib.status]}
            color={getStatusColor(contrib.status) as any}
            size="small"
            variant={contrib.status === "APPROVED" ? "filled" : "outlined"}
          />
          <Chip
            label={HelpCategoryLabels[contrib.category]}
            size="small"
            sx={{ bgcolor: "#f3f4f6" }}
          />
        </Box>

        <Typography variant="h6" fontWeight="bold" mb={1}>
          {contrib.title}
        </Typography>

        <Box display="flex" gap={2} mb={2} color="text.secondary">
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2">{contrib.settlement}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <DateIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {new Date(contrib.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.05),
            borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <HandshakeIcon color="success" fontSize="small" />
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="success.main"
            >
              Мій внесок: {contrib.contributionAmount} од.
            </Typography>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
};
