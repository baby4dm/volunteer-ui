import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// 👇 1. Імпортуємо реальну сторінку (переконайтеся, що файл src/pages/MyRequestsPage.tsx існує)
import { MyRequestsPage } from "./pages/MyRequestsPage";

// --- ТИМЧАСОВІ ЗАГЛУШКИ (MyRequestsPage звідси ми прибрали) ---
const FeedPage = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Стрічка допомоги 🤝</h1>
    <p>Тут буде список запитів від інших людей.</p>
  </div>
);

const DeliveryPage = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Доставка та логістика 🚚</h1>
    <p>Розділ для водіїв та кур'єрів.</p>
  </div>
);
// ----------------------------------------

function App() {
  return (
    <Routes>
      {/* ПУБЛІЧНІ МАРШРУТИ */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ПРИВАТНІ МАРШРУТИ */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/feed" replace />} />

          <Route path="/feed" element={<FeedPage />} />
          {/* 👇 2. Тепер тут використовується реальний компонент */}
          <Route path="/my-requests" element={<MyRequestsPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
