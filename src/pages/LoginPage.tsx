import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TextField, Button, Alert, CircularProgress } from "@mui/material";
import { Logo } from "../components/Logo";
const BACKGROUND_IMAGE_URL =
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("Невірний email або пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        <Logo variant="light" className="mb-8" />

        <div className="w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Вхід</h1>
            <p className="text-gray-500 mt-2">З поверненням, волонтере! 💙💛</p>
          </div>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              label="Пароль"
              name="password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                className="h-12 bg-blue-600 hover:bg-blue-700 font-semibold text-lg"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Увійти"
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-600">
            Немає акаунту?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Зареєструватися
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
