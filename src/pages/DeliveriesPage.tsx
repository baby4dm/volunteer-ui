import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Stack,
  Pagination,
  TextField,
  MenuItem,
  Collapse,
  Button,
  Paper,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

import { ConfirmDialog } from "../components/ConfirmDialog";
import { requestsApi } from "../api/requestsApi";
import { DeliveryCard } from "../components/DeliveryCard";
import { UKRAINE_REGIONS } from "../data/regions";
import { useToast } from "../context/ToastContext";
import { RequestPriorityLabels } from "../types";
import type { DeliveryFilter, DeliveryPreviewResponse } from "../types";

export const DeliveriesPage = () => {
  const { showToast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DeliveryPreviewResponse[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DeliveryFilter>({
    fromRegion: "",
    fromSettlement: "",
    toRegion: "",
    toSettlement: "",
    priority: "" as any,
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

  const fetchData = async () => {
    setLoading(true);
    try {
      let data;
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      if (tabValue === 0) {
        data = await requestsApi.getAvailable(activeFilters, page - 1);
      } else if (tabValue === 1) {
        data = await requestsApi.getMyActive(activeFilters, page - 1);
      } else {
        data = await requestsApi.getMyArchive(activeFilters, page - 1);
      }
      setItems(data.content);
      setTotalPages(data.page.totalPages);
    } catch (e) {
      console.error(e);
      showToast("Не вдалося завантажити список доставок", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabValue, page, filters]);

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
    setItems([]);
  };

  const clearFilters = () => {
    setFilters({
      fromRegion: "",
      fromSettlement: "",
      toRegion: "",
      toSettlement: "",
      priority: "" as any,
    });
    setPage(1);
    showToast("Фільтри скинуто", "info");
  };
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
  const handleTakeOrder = (id: number) => {
    setConfirmDialog({
      open: true,
      title: "Взяти це замовлення в роботу?",
      action: async () => {
        await requestsApi.takeDelivery(id);
        showToast("Замовлення успішно взято в роботу! 🚗", "success");
        fetchData();
      },
    });
  };

  const handleCompleteOrder = (id: number) => {
    setConfirmDialog({
      open: true,
      title: "Завершити доставку?",
      content: "Підтвердіть, що вантаж успішно передано отримувачу.",
      action: async () => {
        await requestsApi.completeDelivery(id);
        showToast("Доставку завершено! Дякуємо за допомогу 🤝", "success");
        fetchData();
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, pb: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Логістика 🚚
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Доступні вантажі" />
          <Tab label="Моя доставка" />
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
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon color="action" />
            <Typography variant="subtitle2">Фільтрувати маршрут</Typography>
          </Box>
          {Object.values(filters).some(Boolean) && (
            <Button
              size="small"
              color="error"
              startIcon={<ClearIcon />}
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
              <Box display="flex" gap={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Звідки (Область)"
                  value={filters.fromRegion}
                  onChange={(e) =>
                    setFilters({ ...filters, fromRegion: e.target.value })
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
                  fullWidth
                  size="small"
                  label="Звідки (Місто)"
                  value={filters.fromSettlement}
                  onChange={(e) =>
                    setFilters({ ...filters, fromSettlement: e.target.value })
                  }
                />
              </Box>

              <Box display="flex" gap={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Куди (Область)"
                  value={filters.toRegion}
                  onChange={(e) =>
                    setFilters({ ...filters, toRegion: e.target.value })
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
                  fullWidth
                  size="small"
                  label="Куди (Місто)"
                  value={filters.toSettlement}
                  onChange={(e) =>
                    setFilters({ ...filters, toSettlement: e.target.value })
                  }
                />
              </Box>

              <TextField
                select
                fullWidth
                size="small"
                label="Пріоритет"
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value as any })
                }
              >
                <MenuItem value="">Будь-який</MenuItem>
                {Object.entries(RequestPriorityLabels).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
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
          {items.length === 0 ? (
            <Typography textAlign="center" color="text.secondary" mt={4}>
              Список порожній
            </Typography>
          ) : (
            items.map((item) => (
              <DeliveryCard
                key={item.id}
                item={item}
                variant={
                  tabValue === 0
                    ? "AVAILABLE"
                    : tabValue === 1
                    ? "ACTIVE"
                    : "ARCHIVE"
                }
                onAction={
                  tabValue === 0
                    ? handleTakeOrder
                    : tabValue === 1
                    ? handleCompleteOrder
                    : undefined
                }
              />
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
