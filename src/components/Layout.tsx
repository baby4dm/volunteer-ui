import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Box,
  Tooltip,
} from "@mui/material";
import {
  VolunteerActivism,
  LocalShipping,
  Handshake,
  Assignment,
  Person,
  ExitToApp,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate("/login");
  };

  const NAV_ITEMS = [
    { label: "Мої запити", path: "/my-requests", icon: <Assignment /> },
    { label: "Допомогти", path: "/feed", icon: <Handshake /> },
    { label: "Доставка", path: "/delivery", icon: <LocalShipping /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppBar position="sticky" color="default" className="bg-white shadow-sm">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <div
              className="flex items-center gap-2 cursor-pointer mr-8"
              onClick={() => navigate("/")}
            >
              <VolunteerActivism className="text-blue-600" />
              <span className="text-xl font-bold text-gray-800 hidden sm:block">
                Допомога
              </span>
            </div>

            <Box className="flex-grow flex gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? "#2563eb" : "#4b5563",
                      backgroundColor: isActive ? "#eff6ff" : "transparent",
                      fontWeight: isActive ? "bold" : "normal",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#f3f4f6" },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Налаштування профілю">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: "#2563eb" }}>
                    {user?.firstName ? (
                      `${user.firstName[0]}${
                        user.lastName ? user.lastName[0] : ""
                      }`.toUpperCase()
                    ) : (
                      <Person />
                    )}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    navigate("/profile");
                  }}
                >
                  <Person sx={{ mr: 1, color: "gray" }} /> Профіль
                </MenuItem>

                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1, color: "error.main" }} />{" "}
                  <span className="text-red-600">Вийти</span>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <main className="flex-grow py-8">
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </main>

      <footer className="bg-white py-6 border-t mt-auto">
        <Container maxWidth="lg" className="text-center text-gray-500 text-sm">
          © Всі права захищені. Сервіс "Допомога" 2026.
        </Container>
      </footer>
    </div>
  );
};
