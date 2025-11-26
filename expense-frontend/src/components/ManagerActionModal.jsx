import React, { useState, useEffect } from "react";
import { useExpenseStore } from "../store/expenseStore";
import { apiFetchBlob } from "../lib/api";
import "../styles/modal.css";

export default function ManagerActionModal({ expense, onClose }) {
  const updateStatus = useExpenseStore((s) => s.updateExpenseStatus);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState("");
  const [previewName, setPreviewName] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!expense) return null;

  async function doUpdate(status) {
    setError("");
    setLoading(true);

    try {
      const st = (status || "").toString().trim().toLowerCase();

      let normalized;
      if (st.includes("approve")) normalized = "approved";
      else if (st.includes("decline") || st.includes("reject")) normalized = "rejected";
      else normalized = "pending";

      const message =
        normalized === "approved"
          ? "Approved by Manager"
          : normalized === "rejected"
          ? "Rejected by Manager"
          : "Pending Review";

      await updateStatus(expense.id, normalized, message);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box1">
        <h3>Expense Details</h3>

        <div className="field-block">
          <label>Expense ID</label>
          <div className="detail-box">{expense.id}</div>
        </div>

        <div className="field-block">
          <label>Employee</label>
          <div className="detail-box">{expense.employeeName}</div>
        </div>

        <div className="field-block">
          <label>Department</label>
          <div className="detail-box">{expense.dept}</div>
        </div>

        <div className="field-block">
          <label>Category</label>
          <div className="detail-box">{expense.category}</div>
        </div>

        <div className="field-block">
          <label>Amount</label>
          <div className="detail-box">₹{expense.amount}</div>
        </div>

        <div className="field-block">
          <label>Date</label>
          <div className="detail-box">{expense.date}</div>
        </div>

        <div className="field-block">
          <label>Description</label>
          <div className="detail-box">
            {expense.description || "No description provided"}
          </div>
        </div>

        {/* RECEIPT HANDLING */}
        <div className="field-block">
          <label>Receipt</label>
          <div className="detail-box">
            {expense.receipt || expense.receiptUrl ? (
              <>
                <button
                  className="cancel-btn"
                  style={{
                    background: "transparent",
                    padding: 0,
                    border: "none",
                    color: "#0f6b73",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={async (e) => {
                    e.preventDefault();
                    setReceiptError("");
                    setLoadingReceipt(true);

                    try {
                      const path = expense.receipt || expense.receiptUrl;

                      // FIXED LINE (this was your error!)
                      const { blob, contentType } = await apiFetchBlob(path);

                      const url = URL.createObjectURL(blob);

                      setPreviewUrl(url);
                      setPreviewType(contentType || "");
                      setPreviewName((path || "").split("/").pop());
                      setPreviewOpen(true);
                    } catch (err) {
                      setReceiptError(err.message || "Failed to load receipt");
                    } finally {
                      setLoadingReceipt(false);
                    }
                  }}
                >
                  {(expense.receipt || expense.receiptUrl).split("/").pop()}
                </button>

                {loadingReceipt && (
                  <span style={{ marginLeft: 8 }}>Loading...</span>
                )}

                {receiptError && (
                  <div className="field-error">{receiptError}</div>
                )}
              </>
            ) : (
              "No receipt"
            )}
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div
          className="modal-buttons"
          style={{ justifyContent: "space-between" }}
        >
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Close
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-reject"
              onClick={() => doUpdate("rejected")}
              disabled={loading}
            >
              Reject
            </button>

            <button
              className="btn-pending"
              onClick={() => doUpdate("pending")}
              disabled={loading}
            >
              Pending
            </button>

            <button
              className="btn-approve"
              onClick={() => doUpdate("approved")}
              disabled={loading}
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      {previewOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewOpen(false);
            setPreviewUrl(null);
          }}
        >
          <div
            className="modal-box1"
            style={{ maxWidth: "90%", width: "auto", padding: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <strong>{previewName}</strong>

              <div>
                <a
                  href={previewUrl}
                  download={previewName}
                  className="cancel-btn"
                  style={{ marginRight: 8 }}
                >
                  Download
                </a>

                <button
                  className="cancel-btn"
                  onClick={() => {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewOpen(false);
                    setPreviewUrl(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {previewType.startsWith("image") ? (
              <img
                src={previewUrl}
                alt={previewName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            ) : (
              <iframe
                src={previewUrl}
                title={previewName}
                style={{ width: "100%",height: "0vh", border: "none" }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}


