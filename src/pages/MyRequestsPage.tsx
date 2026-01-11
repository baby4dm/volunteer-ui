import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  Container,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Collapse,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import type {
  HelpRequestPreviewResponse,
  RequestStatus,
  HelpRequestFilter,
  FulfillmentResponse,
} from "../types";

import {
  RequestPriorityLabels,
  HelpCategoryLabels,
  DeliveryTypeLabels,
} from "../types";

import { requestsApi } from "../api/requestsApi";
import { CreateRequestModal } from "../components/CreateRequestModal";
import { RequestDetailsModal } from "../components/RequestDetailsModal";
import { UKRAINE_REGIONS } from "../data/regions";
import { ProposalCard } from "../components/ProposalCard";
import { RequestCard } from "../components/RequestCard";

export const MyRequestsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );

  const [showFilters, setShowFilters] = useState(false);
  const [requests, setRequests] = useState<HelpRequestPreviewResponse[]>([]);
  const [proposals, setProposals] = useState<FulfillmentResponse[]>([]);
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

  const handleApproveProposal = async (id: number) => {
    try {
      await requestsApi.approveProposal(id);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Помилка при підтвердженні");
    }
  };

  const handleRejectProposal = async (id: number) => {
    if (!window.confirm("Ви точно хочете відхилити цю допомогу?")) return;
    try {
      await requestsApi.rejectProposal(id);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Помилка при відхиленні");
    }
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
        const data = await requestsApi.getMyProposals(page - 1);
        setProposals(data.content);
        setTotalPages(data.totalPages);
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

          {tabValue === 2 &&
            (proposals.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" mt={4}>
                Немає нових пропозицій
              </Typography>
            ) : (
              proposals.map((prop) => (
                <ProposalCard
                  key={prop.id}
                  prop={prop}
                  onApprove={handleApproveProposal}
                  onReject={handleRejectProposal}
                  onRequestClick={handleOpenDetails}
                />
              ))
            ))}

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
