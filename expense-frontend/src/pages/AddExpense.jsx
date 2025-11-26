import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { useExpenseStore } from "../store/expenseStore";
import { useNavigate } from "react-router-dom";

export default function AddExpense() {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const nav = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    addExpense({
      name: name || "Anonymous",
      dept,
      category,
      amount: Number(amount || 0),
      date: date || new Date().toISOString().slice(0, 10),
      status: "Pending",
      description,
    });
    nav("/employee-dashboard");
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <h2 className="h-title">Add Expense</h2>
        <div className="card" style={{ maxWidth: 720 }}>
          <form onSubmit={handleSubmit} className="col">
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <select value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">Select Department</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>HR</option>
              <option>Finance</option>
            </select>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              <option>Travel</option>
              <option>Food</option>
              <option>Entertainment</option>
              <option>Office</option>
            </select>

            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <textarea placeholder="Short description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,var(--accent), var(--primary))", color: "#fff", fontWeight: 700 }}>
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
