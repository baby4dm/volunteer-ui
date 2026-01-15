import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
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
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import type {
  HelpRequestPreviewResponse,
  HelpRequestFilter,
  VolunteerContributionResponse,
  FulfillmentFilter,
  DeliveryType,
  FulfillmentStatus,
} from "../types";

import {
  RequestPriorityLabels,
  HelpCategoryLabels,
  FulfillmentStatusLabels,
} from "../types";

import { requestsApi } from "../api/requestsApi";
import { RequestDetailsModal } from "../components/RequestDetailsModal";
import { CreateProposalModal } from "../components/CreateProposalModal";
import { UKRAINE_REGIONS } from "../data/regions";
import { VolunteerRequestCard } from "../components/VolunteerRequestCard";
import { ContributionCard } from "../components/ContributionCard";

export const HelpOthersPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState<HelpRequestPreviewResponse[]>([]);
  const [contributions, setContributions] = useState<
    VolunteerContributionResponse[]
  >([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [proposalModalData, setProposalModalData] = useState<{
    id: number;
    title: string;
    maxAmount: number;
    deliveryType: DeliveryType;
  } | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<HelpRequestFilter>({
    category: "" as any,
    region: "",
    settlement: "",
    priority: "" as any,
    deliveryType: "" as any,
    isUrgent: false,
  });

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    setSearchQuery("");
    setRequests([]);
    setContributions([]);
    setShowFilters(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // --- Вкладка 0: Потрібна допомога (Всі активні запити) ---
      if (tabValue === 0) {
        const apiFilters: HelpRequestFilter = {
          status: "CREATED" as any,
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.region ? { region: filters.region } : {}),
          ...(filters.settlement ? { settlement: filters.settlement } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.deliveryType
            ? { deliveryType: filters.deliveryType }
            : {}),
          ...(filters.isUrgent ? { isUrgent: true } : {}),
        };
        const data = await requestsApi.getAllRequests(apiFilters, page - 1);
        setRequests(data.content);
        setTotalPages(data.page.totalPages);
      }

      // --- Вкладка 1: Я допомагаю (Тільки активні: PENDING + IN_PROGRESS) ---
      else if (tabValue === 1) {
        const [pendingData, inProgressData] = await Promise.all([
          requestsApi.getMyContributions({ status: "PENDING" }, page - 1),
          requestsApi.getMyContributions({ status: "IN_PROGRESS" }, page - 1),
        ]);

        const combined = [
          ...pendingData.content,
          ...inProgressData.content,
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setContributions(combined);
        setTotalPages(
          Math.max(pendingData.page.totalPages, inProgressData.page.totalPages)
        );
      }

      // --- Вкладка 2: Архів (Тільки завершені: COMPLETED, REJECTED, CANCELED) ---
      else if (tabValue === 2) {
        // Список статусів для архіву (прибрав FAILED, бо його немає у вас в типах)
        const statuses: FulfillmentStatus[] = [
          "COMPLETED",
          "REJECTED",
          "CANCELED",
        ];

        const promises = statuses.map((status) =>
          requestsApi.getMyContributions({ status }, page - 1)
        );

        const results = await Promise.all(promises);

        const combined = results
          .flatMap((res) => res.content)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setContributions(combined);

        const maxPages =
          results.length > 0
            ? Math.max(...results.map((r) => r.page.totalPages))
            : 0;
        setTotalPages(maxPages);
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

  const getFilteredData = () => {
    if (tabValue === 0)
      return requests.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    else
      return contributions.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const displayData = getFilteredData();

  // Фільтри показуємо тільки для першої вкладки
  const hasActiveFilters =
    tabValue === 0
      ? Object.values(filters).some(Boolean) || searchQuery
      : searchQuery;

  const clearFilters = () => {
    setSearchQuery("");
    setPage(1);
    if (tabValue === 0) {
      setFilters({
        category: "" as any,
        region: "",
        settlement: "",
        priority: "" as any,
        deliveryType: "" as any,
        isUrgent: false,
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, pb: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Стрічка допомоги 🤝
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Потрібна допомога" />
          <Tab label="Я допомагаю" />
          <Tab label="Архів" />
        </Tabs>
      </Box>

      <Paper variant="outlined" sx={{ mb: 3, bgcolor: "#fafafa" }}>
        <Box
          p={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => setShowFilters(!showFilters)}
          sx={{ cursor: "pointer" }}
        >
          <Box display="flex" gap={1}>
            <FilterListIcon color="action" />
            <Typography variant="subtitle2">Фільтри та пошук</Typography>
          </Box>
          {hasActiveFilters && (
            <Button
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
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
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ bgcolor: "white" }}
              />

              {/* Фільтри відображаються тільки для вкладки "Потрібна допомога" */}
              {tabValue === 0 && (
                <>
                  <TextField
                    label="Місто"
                    size="small"
                    value={filters.settlement}
                    onChange={(e) =>
                      setFilters({ ...filters, settlement: e.target.value })
                    }
                  />

                  <TextField
                    select
                    label="Область"
                    size="small"
                    value={filters.region}
                    onChange={(e) =>
                      setFilters({ ...filters, region: e.target.value })
                    }
                  >
                    <MenuItem value="">Всі</MenuItem>
                    {UKRAINE_REGIONS.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Категорія"
                    size="small"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        category: e.target.value as any,
                      })
                    }
                  >
                    <MenuItem value="">Всі</MenuItem>
                    {Object.entries(HelpCategoryLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Пріоритет"
                    size="small"
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priority: e.target.value as any,
                      })
                    }
                  >
                    <MenuItem value="">Будь-який</MenuItem>
                    {Object.entries(RequestPriorityLabels).map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        {v}
                      </MenuItem>
                    ))}
                  </TextField>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.isUrgent}
                        onChange={(e) =>
                          setFilters({ ...filters, isUrgent: e.target.checked })
                        }
                        color="error"
                      />
                    }
                    label="Тільки термінові"
                  />
                </>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      {loading ? (
        <Box textAlign="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {displayData.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" mt={4}>
              Нічого не знайдено
            </Typography>
          ) : tabValue === 0 ? (
            (displayData as HelpRequestPreviewResponse[]).map((req) => (
              <VolunteerRequestCard
                key={req.id}
                req={req}
                onClick={setDetailsId}
                onHelp={() =>
                  setProposalModalData({
                    id: req.id,
                    title: req.title,
                    maxAmount: req.amount - (req.receivedAmount || 0),
                    deliveryType: req.deliveryType,
                  })
                }
              />
            ))
          ) : (
            (displayData as VolunteerContributionResponse[]).map((contrib) => (
              <ContributionCard key={contrib.fulfillmentId} contrib={contrib} />
            ))
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

      <CreateProposalModal
        requestId={proposalModalData?.id || null}
        requestTitle={proposalModalData?.title}
        maxAmount={proposalModalData?.maxAmount}
        requestDeliveryType={proposalModalData?.deliveryType}
        onClose={() => setProposalModalData(null)}
        onSuccess={fetchData}
      />
      <RequestDetailsModal
        requestId={detailsId}
        onClose={() => setDetailsId(null)}
      />
    </Container>
  );
};
