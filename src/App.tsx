import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { MyRequestsPage } from "./pages/MyRequestsPage";
import { HelpOthersPage } from "./pages/HelpOthersPage";
import { DeliveriesPage } from "./pages/DeliveriesPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/my-requests" replace />} />

          <Route path="/feed" element={<HelpOthersPage />} />
          <Route path="/my-requests" element={<MyRequestsPage />} />

          <Route path="/delivery" element={<DeliveriesPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
