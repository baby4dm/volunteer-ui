import { useState, useEffect, useCallback } from "react";
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
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

// Словник перекладу статусів
const STATUS_TRANSLATIONS: Record<string, string> = {
  CREATED: "Створено",
  PENDING: "Очікує підтвердження",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Завершено",
  REJECTED: "Відхилено",
  CANCELED: "Скасовано",
  FAILED: "Не вдалося",
};

export const MyRequestsPage = () => {
  const { showToast } = useToast();
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

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    content?: string;
    action: (() => Promise<void>) | null;
  }>({
    open: false,
    title: "",
    action: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const handleConfirmAction = async () => {
    if (!confirmDialog.action) return;
    setActionLoading(true);
    try {
      await confirmDialog.action();
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

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
    showToast("Фільтри скинуто", "info");
  };

  const handleApproveProposal = async (id: number) => {
    try {
      await requestsApi.approveProposal(id);
      showToast("Пропозицію прийнято! 🎉", "success");
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("Помилка при підтвердженні", "error");
    }
  };

  const handleRejectProposal = (id: number) => {
    setConfirmDialog({
      open: true,
      title: "Відхилити допомогу?",
      content: "Ви впевнені? Це дію не можна скасувати.",
      action: async () => {
        await requestsApi.rejectProposal(id);
        showToast("Пропозицію відхилено", "info");
        fetchData();
      },
    });
  };

  const handleDeleteRequest = (id: number) => {
    setConfirmDialog({
      open: true,
      title: "Видалити запит?",
      content: "Це безповоротна дія.",
      action: async () => {
        await requestsApi.delete(id);
        showToast("Запит видалено", "success");
        fetchData();
      },
    });
  };

  const handleManualComplete = (id: number) => {
    setConfirmDialog({
      open: true,
      title: "Завершити збір вручну?",
      content:
        "Статус зміниться на 'Виконано'. Ви впевнені, що хочете закрити збір?",
      action: async () => {
        await requestsApi.complete(id);
        showToast("Збір успішно закрито! 🎉", "success");
        fetchData();
      },
    });
  };

  const handleCompleteFulfillment = (id: number) => {
    setConfirmDialog({
      open: true,
      title: "Підтвердити отримання?",
      content:
        "Натискайте це лише якщо ви фактично отримали допомогу від волонтера.",
      action: async () => {
        await requestsApi.completeFulfillment(id);
        showToast("Допомогу отримано! Дякуємо! 🤝", "success");
        fetchData();
      },
    });
  };

  // --- Helpers ---
  const getUniqueItems = <T extends { id: number; createdAt?: string }>(
    items: T[]
  ): T[] => {
    const map = new Map();
    items.forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return b.id - a.id;
    });
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setRequests([]);
    setProposals([]);

    try {
      // 0. АКТИВНІ ЗАПИТИ
      if (tabValue === 0) {
        const baseFilters = {
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.region ? { region: filters.region } : {}),
          ...(filters.settlement ? { settlement: filters.settlement } : {}),
          ...(filters.priority ? { priority: filters.priority } : {}),
          ...(filters.deliveryType
            ? { deliveryType: filters.deliveryType }
            : {}),
          ...(filters.isUrgent ? { isUrgent: true } : {}),
        };

        const [dataCreated, dataInProgress] = await Promise.all([
          requestsApi.getMyRequests(
            { ...baseFilters, status: "CREATED" as any },
            page - 1
          ),
          requestsApi.getMyRequests(
            { ...baseFilters, status: "IN_PROGRESS" as any },
            page - 1
          ),
        ]);

        const combined = getUniqueItems([
          ...dataCreated.content,
          ...dataInProgress.content,
        ]);
        setRequests(combined);
        setTotalPages(
          Math.max(dataCreated.page.totalPages, dataInProgress.page.totalPages)
        );
      }

      // 1. АРХІВ
      else if (tabValue === 1) {
        // Запити
        const reqData = await requestsApi.getMyRequests(
          {
            status: "COMPLETED" as any,
            ...(filters.category ? { category: filters.category } : {}),
          },
          page - 1
        );
        setRequests(reqData.content);

        // Пропозиції
        const propData = await requestsApi.getMyProposals(page - 1);

        const archivedProps = propData.content.filter((p) =>
          ["COMPLETED", "REJECTED", "CANCELED"].includes(p.status)
        );

        setProposals(getUniqueItems(archivedProps));
        setTotalPages(
          Math.max(reqData.page.totalPages, propData.page.totalPages)
        );
      }

      // 2. АКТИВНІ ПРОПОЗИЦІЇ
      else if (tabValue === 2) {
        const propData = await requestsApi.getMyProposals(page - 1);

        const activeProps = propData.content.filter((p) =>
          ["PENDING", "IN_PROGRESS"].includes(p.status)
        );

        setProposals(getUniqueItems(activeProps));
        setTotalPages(propData.page.totalPages);
      }
    } catch (err) {
      console.error(err);
      showToast("Не вдалося завантажити дані", "error");
    } finally {
      setLoading(false);
    }
  }, [tabValue, page, filters, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDetails = (id: number) => setSelectedRequestId(id);
  const handleCloseDetails = () => setSelectedRequestId(null);

  const getFilteredData = () => {
    const lowerQuery = searchQuery.toLowerCase();

    const filteredRequests = requests.filter((req) =>
      req.title.toLowerCase().includes(lowerQuery)
    );

    const filteredProposals = proposals.filter((prop) =>
      (prop.requestTitle || "").toLowerCase().includes(lowerQuery)
    );

    return { filteredRequests, filteredProposals };
  };

  const { filteredRequests, filteredProposals } = getFilteredData();

  const hasActiveFilters =
    filters.region ||
    filters.category ||
    filters.settlement ||
    filters.priority ||
    filters.deliveryType ||
    filters.isUrgent;

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
            setSearchQuery("");
            setShowFilters(false);
          }}
        >
          <Tab label="Активні" />
          <Tab label="Архів" />
          <Tab label="Пропозиції" />
        </Tabs>
      </Box>

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
                label="Фільтри"
                size="small"
                color="primary"
                sx={{ height: 20 }}
              />
            )}
          </Box>

          {(hasActiveFilters || searchQuery) && (
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
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ bgcolor: "white" }}
              />

              {tabValue === 0 && (
                <>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                      onChange={(e) =>
                        handleFilterChange("region", e.target.value)
                      }
                    >
                      <MenuItem value="">
                        <em>Всі області</em>
                      </MenuItem>
                      {UKRAINE_REGIONS.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                      {Object.entries(HelpCategoryLabels).map(([k, v]) => (
                        <MenuItem key={k} value={k}>
                          {v}
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
                      {Object.entries(RequestPriorityLabels).map(([k, v]) => (
                        <MenuItem key={k} value={k}>
                          {v}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <TextField
                      select
                      sx={{ width: "50%" }}
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
                      {Object.entries(DeliveryTypeLabels).map(([k, v]) => (
                        <MenuItem key={k} value={k}>
                          {v}
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
          {/* --- Вкладка 0: АКТИВНІ ЗАПИТИ --- */}
          {tabValue === 0 &&
            filteredRequests.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                onDelete={handleDeleteRequest}
                onClick={handleOpenDetails}
                onComplete={handleManualComplete}
              />
            ))}

          {/* --- Вкладка 1: АРХІВ --- */}
          {tabValue === 1 && (
            <>
              {/* Реальні запити */}
              {filteredRequests.map((req) => (
                <RequestCard
                  key={`req-${req.id}`}
                  req={req}
                  onDelete={handleDeleteRequest}
                  onClick={handleOpenDetails}
                />
              ))}

              {/* Пропозиції (замасковані під RequestCard) */}
              {filteredProposals.map((prop) => {
                const isCompleted = prop.status === "COMPLETED";
                const uaStatus =
                  STATUS_TRANSLATIONS[prop.status] || prop.status;

                return (
                  <RequestCard
                    key={`prop-${prop.id}`}
                    req={{
                      id: prop.requestId,
                      title: prop.requestTitle,
                      category: "OTHER" as any,
                      // Адреса: відображаємо, щоб не ламати верстку
                      region: "Україна",
                      settlement: "За запитом",
                      priority: "MEDIUM" as any,
                      deliveryType: prop.deliveryType,
                      validUntil: new Date().toISOString(),

                      // Прогрес: 0 якщо не завершено
                      amount: isCompleted ? prop.amount : 0,
                      receivedAmount: isCompleted ? prop.amount : 0,

                      // Статус: перекладений українською
                      status: uaStatus as any,
                    }}
                    onDelete={undefined as any}
                    onClick={handleOpenDetails}
                  />
                );
              })}
            </>
          )}

          {/* --- Вкладка 2: АКТИВНІ ПРОПОЗИЦІЇ --- */}
          {tabValue === 2 &&
            filteredProposals.map((prop) => (
              <ProposalCard
                key={prop.id}
                prop={prop}
                onApprove={handleApproveProposal}
                onReject={handleRejectProposal}
                onRequestClick={handleOpenDetails}
                onComplete={handleCompleteFulfillment}
              />
            ))}

          {/* Empty States */}
          {tabValue === 0 && filteredRequests.length === 0 && (
            <Typography textAlign="center" color="text.secondary">
              Активних запитів не знайдено
            </Typography>
          )}

          {tabValue === 1 &&
            filteredRequests.length === 0 &&
            filteredProposals.length === 0 && (
              <Typography textAlign="center" color="text.secondary">
                Архів порожній
              </Typography>
            )}

          {tabValue === 2 && filteredProposals.length === 0 && (
            <Typography textAlign="center" color="text.secondary">
              Немає нових пропозицій
            </Typography>
          )}

          {/* Пагінація */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                shape="rounded"
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

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        content={confirmDialog.content}
        loading={actionLoading}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={handleConfirmAction}
      />
    </Container>
  );
};
