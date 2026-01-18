import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { UKRAINE_REGIONS } from "../data/regions";
import { Logo } from "../components/Logo";
const BACKGROUND_IMAGE_URL =
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop";

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    region: "",
    settlement: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.region) {
      setError("Будь ласка, оберіть область");
      setLoading(false);
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phoneNumber,
        region: formData.region,
        settlement: formData.settlement,
      });
      showToast("Реєстрація успішна! Увійдіть у свій акаунт.", "success");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      showToast(
        "Помилка реєстрації. Перевірте дані або спробуйте іншу пошту.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
    >
      <div className="fixed inset-0 bg-black/50 z-0"></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        <Logo variant="light" className="mb-8" />

        <div className="w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Реєстрація</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Створіть акаунт, щоб допомагати та отримувати допомогу
            </p>
          </div>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <TextField
              label="Ім'я"
              name="firstName"
              required
              fullWidth
              onChange={handleChange}
            />

            <TextField
              label="Прізвище"
              name="lastName"
              required
              fullWidth
              onChange={handleChange}
            />

            <TextField
              label="Телефон"
              name="phoneNumber"
              required
              fullWidth
              placeholder="+380..."
              onChange={handleChange}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              required
              fullWidth
              onChange={handleChange}
            />

            <Autocomplete
              options={UKRAINE_REGIONS}
              value={formData.region || null}
              onChange={(event, newValue) => {
                setFormData({ ...formData, region: newValue || "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Область"
                  required
                  placeholder="Оберіть зі списку"
                  name="region"
                />
              )}
              noOptionsText="Область не знайдено"
            />

            <TextField
              label="Населений пункт"
              name="settlement"
              required
              fullWidth
              placeholder="напр. Київ"
              onChange={handleChange}
            />

            <TextField
              label="Пароль"
              name="password"
              type="password"
              required
              fullWidth
              onChange={handleChange}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                className="h-12 bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Зареєструватися"
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-sm mt-6">
            Вже є акаунт?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium font-semibold"
            >
              Увійти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
