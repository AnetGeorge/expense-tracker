import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import "../styles/modal.css";

export default function EmployeeModal({ open, onClose, onSave, initial, onDelete }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [departmentId, setDepartmentId] = useState(initial?.departmentId || "");
  const [password, setPassword] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setName(initial?.name || "");
    setEmail(initial?.email || "");
    setDepartmentId(initial?.departmentId || "");
    setPassword("");
  }, [initial]);

  // validators
  const validateEmail = (val) => {
    const v = (val || '').trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(v) ? null : 'Please enter a valid email address.';
  };

  const validatePassword = (val) => {
    if (initial) return null; // password only required when creating
    if (!val || val.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch("/api/departments");
        const list = Array.isArray(res) ? res : res?.body || [];
        if (mounted) setDepartments(list);
      } catch (e) {
        console.warn("Could not load departments", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // final validation before submit
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const errs = {};
    if (emailErr) errs.email = emailErr;
    if (passErr) errs.password = passErr;
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setLoading(false);
      // focus first invalid field
      if (errs.email) {
        const el = document.querySelector('.modal-box-employee input[type="email"]');
        if (el) el.focus();
      } else if (errs.password) {
        const el = document.querySelector('.modal-box-employee input[type="password"]');
        if (el) el.focus();
      }
      return;
    }
    try {
      const payload = {
        name,
        email,
        departmentId: departmentId || null,
        password: password || undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("save employee failed", err);
      setError(err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!initial) return;
    if (!confirm(`Delete ${initial.name}?`)) return;
    setLoading(true);
    try {
      if (onDelete) await onDelete(initial.id);
      onClose();
    } catch (err) {
      console.error('delete failed', err);
      setError(err?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box-employee">
        <h3>{initial ? "Edit Employee" : "Add Employee"}</h3>
        <form onSubmit={submit}>
          <div className="field-block">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="field-block">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                // live-validate while typing
                const ve = validateEmail(v);
                setFieldErrors((s) => ({ ...s, email: ve }));
              }}
              onBlur={(e) => setFieldErrors((s) => ({ ...s, email: validateEmail(e.target.value) }))}
              required
              type="email"
            />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>

          <div className="field-block">
            <label>Department</label>
            <select value={departmentId || ""} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">-- Select --</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
              ))}
            </select>
          </div>

          {!initial && (
            <div className="field-block">
              <label>Password</label>
              <input
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  const vp = validatePassword(v);
                  setFieldErrors((s) => ({ ...s, password: vp }));
                }}
                onBlur={(e) => setFieldErrors((s) => ({ ...s, password: validatePassword(e.target.value) }))}
                type="password"
                required
              />
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <div>
              <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>Cancel</button>
              {initial && (
                <button type="button" className="btn-reject" onClick={remove} disabled={loading} style={{ marginLeft: 8 }}>Delete</button>
              )}
            </div>
            <button type="submit" className="btn-approve" disabled={loading}>{initial ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
