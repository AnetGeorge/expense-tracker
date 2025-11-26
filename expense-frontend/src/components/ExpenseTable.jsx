// import { useMemo, useState } from "react";
import { useState } from "react";
import ManagerActionModal from "./ManagerActionModal";
import "../styles/table.css";

export default function ExpenseTable({ expenses }) {
  const role = localStorage.getItem("role") || "employee";

  // Show all expenses, no pagination
  const paged = expenses || [];

  const [selected, setSelected] = useState(null);

  function openFor(exp) {
    setSelected(exp);
  }

  function closeModal() {
    setSelected(null);
  }

  return (
    <div className="table-card">
      <table className="exp-table">
        <thead>
          <tr>
            <th>Expense ID</th>
            <th>Name</th>
            <th>Dept</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            {role === "manager" && <th>Action</th>}
          </tr>
        </thead>

        <tbody>
          {paged.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.employeeName}</td>

              <td>{e.dept}</td>
              <td>{e.category}</td>
              <td>₹{e.amount}</td>
              <td>{e.date}</td>

              <td>
                <strong>{e.status}</strong>
                {e.message && (
                  <div style={{ fontSize: 12, color: "#555" }}>{e.message}</div>
                )}
              </td>

              {role === "manager" && (
                <td className="actions">
                  <button className="take-action" onClick={() => openFor(e)}>
                    Take Action
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination removed: all expenses shown */}
      {selected && <ManagerActionModal expense={selected} onClose={closeModal} />}
    </div>
  );
}
