import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import { Unauthorized, NotFound } from "./pages/ErrorPages";
import "./App.css";

function AppContent() {
  const { isDarkMode } = useTheme();

  const themeConfig = {
    token: {
      colorPrimary: "#4F46E5",
      borderRadius: 6,
      fontFamily: "'Inter', sans-serif",
    },
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    components: {
      Menu: {
        colorBgContainer: isDarkMode ? "#141414" : "#FFFFFF",
        colorBgSelectedItem: isDarkMode ? "#1E1B4B" : "#EEF2FF",
      },
      Button: {
        colorBgContainer: isDarkMode ? "#1F1F1F" : "#FFFFFF",
      },
      Card: {
        colorBgContainer: isDarkMode ? "#141414" : "#FFFFFF",
        colorBorderBg: isDarkMode ? "#141414" : "#FFFFFF",
      },
      Table: {
        colorBgContainer: isDarkMode ? "#141414" : "#FFFFFF",
        colorBgElevated: isDarkMode ? "#1F1F1F" : "#FFFFFF",
      },
      Input: {
        colorBgContainer: isDarkMode ? "#0A0E27" : "#F8FAFC",
        colorBgElevated: isDarkMode ? "#141414" : "#FFFFFF",
      },
      Select: {
        colorBgContainer: isDarkMode ? "#0A0E27" : "#F8FAFC",
        colorBgElevated: isDarkMode ? "#141414" : "#FFFFFF",
      },
      Modal: {
        colorBgElevated: isDarkMode ? "#141414" : "#FFFFFF",
      },
      Dropdown: {
        colorBgElevated: isDarkMode ? "#141414" : "#FFFFFF",
      },
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Error pages */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Root redirect - goes to dashboard, ProtectedRoute handles auth */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              } 
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
