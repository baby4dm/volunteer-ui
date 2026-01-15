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

export const MyRequestsPage = () => {
  const { showToast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );

  const [showFilters, setShowFilters] = useState(false);

  // Стейт даних
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

  // --- Actions ---
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

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    setRequests([]);
    setProposals([]);

    try {
      // 0. АКТИВНІ ЗАПИТИ (Я створив)
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

        const combinedContent = [
          ...dataCreated.content,
          ...dataInProgress.content,
        ];

        setRequests(combinedContent);
        setTotalPages(
          Math.max(dataCreated.page.totalPages, dataInProgress.page.totalPages)
        );
      }

      // 1. АРХІВ (Все завершене)
      else if (tabValue === 1) {
        // --- 1.1 Мої запити (Тільки COMPLETED) ---
        const reqData = await requestsApi.getMyRequests(
          {
            status: "COMPLETED" as any,
            ...(filters.category ? { category: filters.category } : {}),
          },
          page - 1
        );
        setRequests(reqData.content);

        // --- 1.2 Мої пропозиції (COMPLETED, REJECTED, CANCELED) ---
        // Завантажуємо всі архівні статуси
        const [completedProps, rejectedProps, canceledProps] =
          await Promise.all([
            requestsApi.getMyProposals(
              { status: "COMPLETED" } as any,
              page - 1
            ),
            requestsApi.getMyProposals({ status: "REJECTED" } as any, page - 1),
            requestsApi.getMyProposals({ status: "CANCELED" } as any, page - 1),
          ]);

        // Об'єднуємо їх в один масив
        const combinedProposals = [
          ...completedProps.content,
          ...rejectedProps.content,
          ...canceledProps.content,
        ]
          // Про всяк випадок фільтруємо, щоб бути певними, що тут тільки архів
          .filter((p) =>
            ["COMPLETED", "REJECTED", "CANCELED"].includes(p.status)
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setProposals(combinedProposals);

        const maxPages = Math.max(
          reqData.page.totalPages,
          completedProps.page.totalPages,
          rejectedProps.page.totalPages,
          canceledProps.page.totalPages
        );
        setTotalPages(maxPages);
      }

      // 2. АКТИВНІ ПРОПОЗИЦІЇ (Я допомагаю)
      else if (tabValue === 2) {
        const [pendingData, inProgressData] = await Promise.all([
          requestsApi.getMyProposals({ status: "PENDING" } as any, page - 1),
          requestsApi.getMyProposals(
            { status: "IN_PROGRESS" } as any,
            page - 1
          ),
        ]);

        const combined = [...pendingData.content, ...inProgressData.content]
          // Жорсткий фільтр: тут ТІЛЬКИ активні. Відхилені сюди не пройдуть.
          .filter((p) => ["PENDING", "IN_PROGRESS"].includes(p.status))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        setProposals(combined);
        setTotalPages(
          Math.max(pendingData.page.totalPages, inProgressData.page.totalPages)
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Не вдалося завантажити дані", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue, page, filters]);

  const handleOpenDetails = (id: number) => setSelectedRequestId(id);
  const handleCloseDetails = () => setSelectedRequestId(null);

  // --- Фільтрація (Пошук) ---
  const getFilteredData = () => {
    const lowerQuery = searchQuery.toLowerCase();

    // Для вкладки Активні та Архів
    const filteredRequests = requests.filter((req) =>
      req.title.toLowerCase().includes(lowerQuery)
    );

    // Для вкладки Пропозиції та Архів
    const filteredProposals = proposals.filter((prop) =>
      prop.requestTitle.toLowerCase().includes(lowerQuery)
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
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ bgcolor: "white" }}
              />

              {/* Фільтри показуємо лише для вкладки "Активні" (0) */}
              {tabValue === 0 && (
                <>
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
                    {Object.entries(RequestPriorityLabels).map(
                      ([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      )
                    )}
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
              {/* Завершені запити */}
              {filteredRequests.map((req) => (
                <RequestCard
                  key={`req-${req.id}`}
                  req={req}
                  onDelete={handleDeleteRequest}
                  onClick={handleOpenDetails}
                  // В архіві кнопка завершення не потрібна
                />
              ))}

              {/* Пропозиції: Завершені, Відхилені, Скасовані */}
              {filteredProposals.map((prop) => (
                <ProposalCard
                  key={`prop-${prop.id}`}
                  prop={prop}
                  // Всі Actions передаємо пустими або null, щоб картка була "як завершена"
                  onApprove={async () => {}}
                  onReject={() => {}}
                  onRequestClick={handleOpenDetails}
                  onComplete={() => {}}
                />
              ))}
            </>
          )}

          {/* --- Вкладка 2: АКТИВНІ ПРОПОЗИЦІЇ (Pending / In Progress) --- */}
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
