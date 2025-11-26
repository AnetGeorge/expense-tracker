import { useEffect, useState } from "react";
import { useExpenseStore } from "../store/expenseStore";
import "../styles/modal.css";

export default function ExpenseModal({ onClose }) {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const fetchCategories = useExpenseStore((s) => s.fetchCategories);
  const fetchDepartments = useExpenseStore((s) => s.fetchDepartments);
  const categories = useExpenseStore((s) => s.categories);
  const departments = useExpenseStore((s) => s.departments);

  const [dept, setDept] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [manager, setManager] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories().catch(() => {});
    fetchDepartments().catch(() => {});
  }, [fetchCategories, fetchDepartments]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    setFileName(file ? file.name : "No file selected");
    setReceiptFile(file || null);
  }

  function validate() {
    const e = {};
    if (!category) e.category = "Please select a category";
    if (!amount) e.amount = "Please enter an amount";
    else if (isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Amount must be a positive number";
    if (!date) e.date = "Please select a date";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      const categoryId = categories && categories.length
        ? (typeof category === 'number' ? category : Number(category))
        : null;

      await addExpense({
        category: categoryId || category,
        amount: Number(amount),
        date,
        description,
        receiptFile,
      });
      onClose();
    } catch (err) {
      console.error("Failed to submit expense", err);
      setErrors({ server: err.message || "Failed to submit expense" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Submit New Expense Request</h3>

        {errors.server && <div className="form-error">{errors.server}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Department</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Select Department</option>
            {departments && departments.length
              ? departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.name}
                  </option>
                ))
              : (
                <>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                </>
              )}
          </select>

          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories && categories.length
              ? categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))
              : (
                <>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                </>
              )}
          </select>
          {errors.category && <div className="field-error">{errors.category}</div>}

          <label>Amount</label>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors.amount && <div className="field-error">{errors.amount}</div>}

          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {errors.date && <div className="field-error">{errors.date}</div>}

          <label>Report To</label>
          <input
            type="text"
            placeholder="Manager Name"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
          />

          <label>Description/Notes</label>
          <textarea
            rows={3}
            placeholder="Provide description about the expense"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <label>Upload Receipt (optional)</label>
          <div className="file-wrapper">
            <input type="file" onChange={handleFileChange} />
            <span className="file-text">{fileName || "No selected file"}</span>
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
