import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ExpenseTable from "../components/ExpenseTable";
import ChartCard from "../components/ChartCard";
import StatusBar from "../components/StatusBar";
import ExpenseModal from "../components/ExpenseModal";
import { useExpenseStore } from "../store/expenseStore";
import "../styles/expenses.css";

export default function Expenses() {
  const expenses = useExpenseStore((s) => s.expenses);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const role = localStorage.getItem("role") || "employee";
  const loadMyExpenses = useExpenseStore((s) => s.loadMyExpenses);
  const loadManagerExpenses = useExpenseStore((s) => s.loadManagerExpenses);
  const categories = useExpenseStore((s) => s.categories);
  const fetchCategories = useExpenseStore((s) => s.fetchCategories);

  // Load on mount and when manager filters change
  useEffect(() => {
    if (role === "employee") {
      // employee: load all and filter client-side
      loadMyExpenses().catch((e) => console.warn('loadMyExpenses failed', e));
    } else {
      // manager: load from backend using filters
      loadManagerExpenses(status || "all", category).catch((e) => console.warn('loadManagerExpenses failed', e));
    }
  }, [role, loadMyExpenses, loadManagerExpenses, status, category]);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      fetchCategories().catch((e) => console.warn('fetchCategories failed', e));
    }
  }, [categories, fetchCategories]);

  // For employees, apply client-side filters; for manager use server-provided list
  const filteredExpenses = role === "employee"
    ? expenses.filter((exp) => {
        const matchCategory = category ? exp.category?.toLowerCase() === category.toLowerCase() : true;
        const matchStatus = status ? exp.status?.toLowerCase() === status.toLowerCase() : true;
        return matchCategory && matchStatus;
      })
    : expenses;

  // Chart Data (unchanged)
  const chartData = [];
  if (role === "manager" && expenses && expenses.length) {
    const map = {};
    for (const e of expenses) {
      const key = e.date || "";
      const amt = Number(e.amount) || 0;
      map[key] = (map[key] || 0) + amt;
    }
    const rows = Object.keys(map)
      .sort()
      .map((k) => ({ name: k, value: map[k] }));
    chartData.push(...rows);
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Topbar />

        <div className="exp-header">
          <h2 className="h-title expenses-title">
            {role === "employee" ? "My Expenses" : "Expense Overview"}
          </h2>

          {role === "employee" && (
            <div className="exp-actions">
              <select
                className="filter-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Filter by Category</option>
                {(categories || []).map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">Filter by Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <button className="exp-add-btn" onClick={() => setOpen(true)}>
                Add an Expense
              </button>
            </div>
          )}

          {role !== "employee" && (
            <div className="exp-actions">
              <select
                className="filter-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="filter-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {(categories || []).map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {role === "manager" && (
          <div style={{ marginBottom: 20 }}>
            <ChartCard title="" data={chartData.length ? chartData : [{ name: "No Data", value: 0 }]} />
          </div>
        )}

        {role === "employee" && (
          <div style={{ marginBottom: 20 }}>
            <StatusBar expenses={expenses} />
          </div>
        )}

        {/* 🔥 Filtered Expenses passed to table */}
        <ExpenseTable expenses={filteredExpenses} />

        {open && <ExpenseModal onClose={() => setOpen(false)} />}
      </div>
    </div>
  );
}
