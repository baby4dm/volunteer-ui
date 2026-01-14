import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  content?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const ConfirmDialog = ({
  open,
  title,
  content,
  onClose,
  onConfirm,
  loading,
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>{title}</DialogTitle>

      {content && (
        <DialogContent>
          <Typography color="text.secondary">{content}</Typography>
        </DialogContent>
      )}

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Скасувати
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? "Обробка..." : "Так, підтвердити"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
