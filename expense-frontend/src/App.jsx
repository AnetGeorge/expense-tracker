import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ManagerDashboard from "./pages/ManagerDashboard";
import Employees from "./pages/Employees";
import Expenses from "./pages/Expenses";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AddExpense from "./pages/AddExpense";
import { useAuthStore } from "./store/authStore";

function Protected({ children, roles }) {
  const role = useAuthStore((s) => s.role) || localStorage.getItem("role");
  if (!role) return <Navigate to="/" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <Protected roles={["manager"]}>
            <ManagerDashboard />
          </Protected>
        }
      />

      <Route
        path="/employees"
        element={
          <Protected roles={["manager"]}>
            <Employees />
          </Protected>
        }
      />

      <Route
        path="/expenses"
        element={
          // Allow both manager and employee to access the expenses listing.
          <Protected roles={["manager", "employee"]}>
            <Expenses />
          </Protected>
        }
      />

      <Route
        path="/employee-dashboard"
        element={
          <Protected roles={["employee"]}>
            <EmployeeDashboard />
          </Protected>
        }
      />

      <Route
        path="/add-expense"
        element={
          <Protected roles={["employee"]}>
            <AddExpense />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
