import { create } from "zustand";
import { apiFetch } from "../lib/api";

export const useEmployeeStore = create((set) => ({
  employees: [],
  loading: false,

  // Fetch employees from backend (manager-only endpoint)
  fetchEmployees: async () => {
    set({ loading: true });
    try {
      // get departments to map departmentId -> name
      const deptsRes = await apiFetch("/api/departments");
      const depts = Array.isArray(deptsRes) ? deptsRes : deptsRes?.body || [];
      const deptMap = (depts || []).reduce((m, d) => { m[d.departmentId] = d.name; return m; }, {});

      const res = await apiFetch("/api/users/employees");
      const list = Array.isArray(res) ? res : res?.body || [];

      // backend returns UserResponse with userId, name, email, role, departmentId
      const mapped = (list || []).map((u) => ({
        id: u.userId,
        name: u.name || u.email,
        dept: deptMap[u.departmentId] || u.departmentId,
        departmentId: u.departmentId,
        email: u.email,
        role: u.role,
      }));

      set({ employees: mapped, loading: false });
      return mapped;
    } catch (err) {
      console.error("fetchEmployees failed", err);
      set({ employees: [], loading: false });
      return [];
    }
  },

  addEmployee: (emp) => set((s) => ({ employees: [...s.employees, emp] })),
  setEmployees: (list) => set({ employees: list }),

  // Create employee via backend and prepend to list
  createEmployee: async (payload) => {
    try {
      const res = await apiFetch('/api/users/employee', { method: 'POST', body: JSON.stringify(payload) });
      const created = Array.isArray(res) ? res[0] : res?.body || res;
      const item = {
        id: created.userId,
        name: created.name || created.email,
        dept: created.departmentId,
        email: created.email,
      };
      set((s) => ({ employees: [item, ...s.employees] }));
      return item;
    } catch (err) {
      console.error('createEmployee failed', err);
      throw err;
    }
  },

  updateEmployee: async (id, payload) => {
    try {
      const res = await apiFetch(`/api/users/employee/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      const updated = Array.isArray(res) ? res[0] : res?.body || res;
      set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, name: updated.name || updated.email, dept: updated.departmentId, email: updated.email } : e)) }));
      return updated;
    } catch (err) {
      console.error('updateEmployee failed', err);
      throw err;
    }
  },

  deleteEmployee: async (id) => {
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
      return true;
    } catch (err) {
      console.error('deleteEmployee failed', err);
      throw err;
    }
  },
}));
