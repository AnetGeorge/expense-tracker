import React, { useState } from "react";
import "../styles/table.css";
import EmployeeModal from "./EmployeeModal";
import { useEmployeeStore } from "../store/employeeStore";
import { useEffect } from "react";

export default function EmployeeCards() {
  const employees = useEmployeeStore((s) => s.employees || []);
  const createEmployee = useEmployeeStore((s) => s.createEmployee);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const deleteEmployee = useEmployeeStore((s) => s.deleteEmployee);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const onAdd = () => { setEditing(null); setModalOpen(true); };
  const onEdit = (emp) => { setEditing(emp); setModalOpen(true); };
  const onDelete = async (empId) => {
    if (!confirm(`Delete this employee?`)) return;
    try {
      await deleteEmployee(empId);
    } catch (e) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const onSave = async (payload) => {
    if (editing) {
      await updateEmployee(editing.id, payload);
      await fetchEmployees();
    } else {
      await createEmployee({ ...payload, password: payload.password || Math.random().toString(36).slice(-8) });
      await fetchEmployees();
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
  <div className="employee-page">
    <div className="employee-header">
      <h2>Employees</h2>
      <button className="add-btn" onClick={onAdd}>+ Add Employee</button>
    </div>

    <div className="employee-grid">
      {employees.map((emp) => (
        <div 
          key={emp.id} 
          className="employee-card"
          onClick={() => onEdit(emp)}
        >
          <div className="emp-name">{emp.name}</div>
          <div className="emp-dept">{emp.dept}</div>
        </div>
      ))}
    </div>

    <EmployeeModal 
      open={modalOpen} 
      onClose={() => { setModalOpen(false); setEditing(null); }} 
      onSave={onSave} 
      initial={editing} 
      onDelete={async (id) => { await onDelete(id); setEditing(null); }}
    />
  </div>
);

}
