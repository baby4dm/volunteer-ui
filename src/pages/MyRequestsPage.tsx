import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  CircularProgress,
  Pagination,
  LinearProgress,
  Stack,
  Container,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Collapse,
  Paper,
  CardActionArea,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  PriorityHigh as PriorityIcon,
  Category as CategoryIcon,
  Event as DateIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";

import type {
  HelpRequestPreviewResponse,
  RequestStatus,
  FulfillmentProposal,
  HelpRequestFilter,
} from "../types";

import {
  RequestStatusLabels,
  RequestPriorityLabels,
  HelpCategoryLabels,
  DeliveryTypeLabels,
} from "../types";

import { requestsApi } from "../api/requestsApi";
import { CreateRequestModal } from "../components/CreateRequestModal";
import { RequestDetailsModal } from "../components/RequestDetailsModal";
import { UKRAINE_REGIONS } from "../data/regions";

const RequestCard = ({
  req,
  onDelete,
  onClick,
}: {
  req: HelpRequestPreviewResponse;
  onDelete: (id: number) => void;
  onClick: (id: number) => void;
}) => {
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

      <CardActions sx={{ position: "absolute", right: 0, top: 0, p: 1 }}>
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
      </CardActions>
    </Card>
  );
};

export const MyRequestsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );

  const [showFilters, setShowFilters] = useState(false);
  const [requests, setRequests] = useState<HelpRequestPreviewResponse[]>([]);
  const [proposals, setProposals] = useState<FulfillmentProposal[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<HelpRequestFilter>({
    category: "" as any,
    region: "",
    settlement: "",
    priority: "" as any,
    deliveryType: "" as any,
    isUrgent: false,
  });

  const handleFilterChange = (field: keyof HelpRequestFilter, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "" as any,
      region: "",
      settlement: "",
      priority: "" as any,
      deliveryType: "" as any,
      isUrgent: false,
    });
    setSearchQuery("");
    setPage(1);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabValue === 0 || tabValue === 1) {
        const statusFilter: RequestStatus =
          tabValue === 0 ? "CREATED" : "COMPLETED";

        const apiFilters: HelpRequestFilter = {
          status: statusFilter,
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.region ? { region: filters.region } : {}),
          ...(filters.settlement ? { settlement: filters.settlement } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.deliveryType
            ? { deliveryType: filters.deliveryType }
            : {}),
          ...(filters.isUrgent ? { isUrgent: true } : {}),
        };

        const data = await requestsApi.getMyRequests(apiFilters, page - 1);
        setRequests(data.content);
        setTotalPages(data.totalPages);
      } else {
        const data = await requestsApi.getMyProposals();
        setProposals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue, page, filters]);

  const displayRequests = requests.filter((req) =>
    req.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteRequest = async (id: number) => {
    if (!window.confirm("Видалити?")) return;
    await requestsApi.delete(id);
    fetchData();
  };

  const handleOpenDetails = (id: number) => setSelectedRequestId(id);
  const handleCloseDetails = () => setSelectedRequestId(null);

  const hasActiveFilters =
    filters.region ||
    filters.category ||
    filters.settlement ||
    filters.priority ||
    filters.deliveryType ||
    filters.isUrgent ||
    searchQuery;

  return (
    <Container maxWidth="md" sx={{ pb: 4, mt: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Мої запити
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Створити
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => {
            setTabValue(val);
            setPage(1);
          }}
        >
          <Tab label="Активні" />
          <Tab label="Архів" />
          <Tab label="Пропозиції" />
        </Tabs>
      </Box>

      {tabValue !== 2 && (
        <Paper variant="outlined" sx={{ mb: 3, bgcolor: "#fafafa" }}>
          <Box
            p={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            onClick={() => setShowFilters(!showFilters)}
            sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f0f0f0" } }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <FilterListIcon color="action" />
              <Typography variant="subtitle2">Фільтри та пошук</Typography>
              {hasActiveFilters && (
                <Chip
                  label="Активні"
                  size="small"
                  color="primary"
                  sx={{ height: 20 }}
                />
              )}
            </Box>

            {hasActiveFilters && (
              <Button
                startIcon={<ClearIcon />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                color="error"
              >
                Скинути
              </Button>
            )}
          </Box>

          <Collapse in={showFilters}>
            <Box p={2} pt={0}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  placeholder="Пошук за назвою..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                  sx={{ bgcolor: "white" }}
                />

                <TextField
                  fullWidth
                  label="Місто / Село"
                  size="small"
                  value={filters.settlement}
                  onChange={(e) =>
                    handleFilterChange("settlement", e.target.value)
                  }
                />

                <TextField
                  select
                  fullWidth
                  label="Область"
                  size="small"
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                >
                  <MenuItem value="">
                    <em>Всі області</em>
                  </MenuItem>
                  {UKRAINE_REGIONS.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Категорія"
                  size="small"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Всі категорії</em>
                  </MenuItem>
                  {Object.entries(HelpCategoryLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Пріоритет"
                  size="small"
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Будь-який</em>
                  </MenuItem>
                  {Object.entries(RequestPriorityLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Тип доставки"
                  size="small"
                  value={filters.deliveryType}
                  onChange={(e) =>
                    handleFilterChange("deliveryType", e.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Будь-який</em>
                  </MenuItem>
                  {Object.entries(DeliveryTypeLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isUrgent || false}
                      onChange={(e) =>
                        handleFilterChange("isUrgent", e.target.checked)
                      }
                      color="error"
                    />
                  }
                  label="Тільки термінові"
                />
              </Stack>
            </Box>
          </Collapse>
        </Paper>
      )}

      {loading ? (
        <Box textAlign="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {(tabValue === 0 || tabValue === 1) &&
            displayRequests.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                onDelete={handleDeleteRequest}
                onClick={handleOpenDetails}
              />
            ))}

          {displayRequests.length === 0 && tabValue !== 2 && (
            <Typography textAlign="center" color="text.secondary">
              Записів не знайдено
            </Typography>
          )}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
              />
            </Box>
          )}
        </Stack>
      )}

      <CreateRequestModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          if (tabValue === 0) fetchData();
          else setTabValue(0);
        }}
      />

      <RequestDetailsModal
        requestId={selectedRequestId}
        onClose={handleCloseDetails}
      />
    </Container>
  );
};
