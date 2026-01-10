import { useAuth } from "../context/AuthContext";
import { Paper, Typography, Avatar, Divider, Chip } from "@mui/material";
import { LocationOn, Phone, Email } from "@mui/icons-material";

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return <div>Завантаження...</div>;

  const getInitials = () => {
    const first = user.firstName ? user.firstName[0] : "";
    const last = user.lastName ? user.lastName[0] : "";
    return (first + last).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Paper elevation={1} className="p-8 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#2563eb",
              fontSize: 36,
              fontWeight: "bold",
            }}
          >
            {getInitials()}
          </Avatar>

          <div className="text-center sm:text-left">
            <Typography variant="h4" className="font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </Typography>

            <Chip
              label={user.role === "ADMIN" ? "Адміністратор" : "Волонтер"}
              color="primary"
              size="small"
              className="mt-2"
              variant="outlined"
            />
          </div>
        </div>

        <Divider className="my-6" />

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Email color="action" />
            <span className="font-medium">{user.email}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <Phone color="action" />
            <span className="font-medium">
              {user.phoneNumber || "Телефон не вказано"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <LocationOn color="action" />
            <span className="font-medium">
              {user.region && user.settlement
                ? `${user.settlement}, ${user.region}`
                : "Адреса не вказана"}
            </span>
          </div>
        </div>
      </Paper>
    </div>
  );
};
