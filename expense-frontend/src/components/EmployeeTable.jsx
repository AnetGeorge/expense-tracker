import React from "react";

export default function EmployeeTable({ employees = [] }) {
  return (
    <div className="card table-card">
      <h3 style={{ marginTop: 0 }}>Employees</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Dept</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.dept}</td>
              <td>{emp.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
