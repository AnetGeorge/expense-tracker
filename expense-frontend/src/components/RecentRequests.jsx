import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import '../styles/dashboard.css';
import { useNavigate } from "react-router-dom";


export default function RecentRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        const deptId = user?.departmentId || null;

        // fetch pending requests for manager's department
        const url = deptId ? `/api/expenses/status/pending?departmentId=${deptId}` : '/api/expenses/status/pending';
        let res;
        try {
          res = await apiFetch(url);
        } catch (e) {
          // treat 404 or empty as no items
          console.warn('RecentRequests: no pending items', e?.message || e);
          res = [];
        }

        const list = Array.isArray(res) ? res : res?.body || [];

        const mapped = (list || []).slice(0, 3).map((r) => ({
          id: r.expenseId,
          title: r.description || 'Expense',
          amount: r.amount,
          date: r.date,
          status: r.status,
        }));

        if (mounted) setItems(mapped);
      } catch (err) {
        console.error('RecentRequests error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
  <div className="recent-requests-container">
    {loading && <div className="recent-loading">Loading...</div>}
    {!loading && items.length === 0 && <div className="recent-empty">No recent requests</div>}

    <ul className="recent-list">
      {items.map((it) => (
        <li key={it.id} className="recent-item">
          <div className="recent-left">
            <div className="recent-title">{it.title}</div>
            <div className="recent-date">{it.date}</div>
          </div>
          <div className="recent-right">
            <div className="recent-amount">₹{it.amount}</div>
            <span className={`status-badge ${it.status.toLowerCase()}`}>
              {it.status.charAt(0).toUpperCase() + it.status.slice(1)}
            </span>
          </div>
        </li>
      ))}
    </ul>

    {/* 🔹 SHOW MORE BUTTON */}
    <div style={{ textAlign: "right", marginTop: "10px" }}>
      <button
        className="show-more-btn"
        onClick={() => navigate("/expenses")}
      >
        Show More →
      </button>
    </div>
  </div>
);


}
