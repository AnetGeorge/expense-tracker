import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useExpenseStore } from "../store/expenseStore";
import { useEffect } from "react";
import "../styles/dashboard.css";
import Illustration from "../emp1.png";
export default function EmployeeDashboard() {
  const expenses = useExpenseStore((s) => s.expenses);
  const loadMyExpenses = useExpenseStore((s) => s.loadMyExpenses);

  useEffect(() => {
    loadMyExpenses().catch((e) => console.warn('loadMyExpenses failed', e));
  }, [loadMyExpenses]);

  const total = (expenses || []).length;
  const approved = (expenses || []).filter(e => (e.status || '').toLowerCase().includes('approve')).length;
  const pending = (expenses || []).filter(e => (e.status || '').toLowerCase().includes('pend')).length;

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Topbar />

        <h1 className="page-title">Hey there!</h1>
        <p className="subtitle">
          Let’s track smart and spend smarter today.
        </p>

        <div className="banner">
          <div>
            <h3>Got a new claim?</h3>
            <p>Just add it here and let your manager do the magic.</p>
          </div>

          <img src={Illustration} alt="illustration" className="banner-img1" />
        </div>

        {/* Cards */}
        <div className="info-card-row">
          <div className="info-card">
            <h4>Total Submitted Expenses</h4>
            <h2>{total}</h2>
          </div>

          <div className="info-card">
            <h4>Approved Expenses</h4>
            <h2>{approved}</h2>
          </div>

          <div className="info-card">
            <h4>Pending Expenses</h4>
            <h2>{pending}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
