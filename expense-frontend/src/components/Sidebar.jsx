import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const { pathname } = useLocation();
  const role = localStorage.getItem("role") || "manager";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Expense Tracker</div>

      <nav className="sidebar-links">
        {role === "manager" ? (
          <>
            <Link
              to="/dashboard"
              className={pathname === "/dashboard" ? "active" : ""}
            >
              Dashboard
            </Link>

            <Link
              to="/employees"
              className={pathname === "/employees" ? "active" : ""}
            >
              Employees
            </Link>

            <Link
              to="/expenses"
              className={pathname === "/expenses" ? "active" : ""}
            >
              Expense
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/employee-dashboard"
              className={
                pathname === "/employee-dashboard" ? "active" : ""
              }
            >
              Dashboard
            </Link>

            {/* Employees should open the shared Expenses page which contains the + button and modal */}
            <Link
              to="/expenses"
              className={pathname === "/expenses" ? "active" : ""}
            >
              Expense
            </Link>
          </>
        )}

        <Link to="/" className="logout-link">
          Logout
        </Link>
      </nav>
    </aside>
  );
}
