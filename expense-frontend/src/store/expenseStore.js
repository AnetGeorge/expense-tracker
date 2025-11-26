import { create } from "zustand";
import { apiFetch, apiUpload } from "../lib/api";

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  categories: [],
  departments: [],
  loading: false,

  // fetch categories (optional, used to map names -> ids)
  fetchCategories: async () => {
    try {
      const res = await apiFetch("/api/categories");
      const cats = Array.isArray(res) ? res : res?.body || [];
      set({ categories: cats });
      return cats;
    } catch (err) {
      console.error("fetchCategories failed", err);
      set({ categories: [] });
      return [];
    }
  },

  fetchDepartments: async () => {
    try {
      const res = await apiFetch("/api/departments");
      const depts = Array.isArray(res) ? res : res?.body || [];
      set({ departments: depts });
      return depts;
    } catch (err) {
      console.error("fetchDepartments failed", err);
      set({ departments: [] });
      return [];
    }
  },

  // Load expenses for the logged-in employee, with optional filters
  loadMyExpenses: async () => {
    set({ loading: true });
    try {
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      if (!user || !user.userId) {
        set({ expenses: [], loading: false });
        return [];
      }

      // ensure categories/departments loaded for mapping
      if (!get().categories.length) await get().fetchCategories();
      if (!get().departments.length) await get().fetchDepartments();

      // Build base URL for user expenses (filtering handled client-side)
      let url = `/api/expenses/user/${user.userId}`;
      const res = await apiFetch(url);

      if (res?.error) throw new Error(res.error);
      const list = Array.isArray(res) ? res : res?.body || [];

      const catMap = (get().categories || []).reduce((m, c) => { m[c.categoryId] = c.name; return m; }, {});
      const deptMap = (get().departments || []).reduce((m, d) => { m[d.departmentId] = d.name; return m; }, {});

      const mapped = list.map((e) => ({
        id: e.expenseId,
        employeeName: user.name || user.email || "You",
        dept: deptMap[e.departmentId] || e.departmentId,
        category: catMap[e.categoryId] || e.categoryId,
        amount: e.amount,
        description: e.description,
        receipt: e.receiptUrl || e.receipt || null,
        date: e.date,
        status: e.status || "Pending",
        message: e.status ? (e.status.toLowerCase().includes("approve") ? "Approved by Manager" : (e.status.toLowerCase().includes("decline") || e.status.toLowerCase().includes("reject") ? "Rejected by Manager" : e.status)) : "Pending Review",
      }));

      set({ expenses: mapped, loading: false });
      return mapped;
    } catch (err) {
      set({ expenses: [], loading: false });
      throw err;
    }
  },

  // Manager: load expenses by status/category
  loadManagerExpenses: async (status = "pending", category = "") => {
    set({ loading: true });
    try {
      // infer department id for manager if available
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const deptId = user?.departmentId || null;

      const fetchFor = async (s) => {
  let url = deptId ? `/api/expenses/status/${encodeURIComponent(s)}?departmentId=${deptId}` : `/api/expenses/status/${encodeURIComponent(s)}`;
  if (category) url += (url.includes("?") ? "&" : "?") + `categoryId=${encodeURIComponent(category)}`;
        try {
          const res = await apiFetch(url);
          if (res?.error) throw new Error(res.error);
          return Array.isArray(res) ? res : res?.body || [];
        } catch (e) {
          // backend returns 404 when no expenses for that status; treat as empty
          console.warn(`No expenses for status=${s}`, e?.message || e);
          return [];
        }
      };

      let combinedRaw = [];
      if (status === "all") {
        const pending = await fetchFor("pending");
        const approved = await fetchFor("approved");
        const rejected = await fetchFor("rejected");
        combinedRaw = [...pending, ...approved, ...rejected];
        // dedupe by expenseId
        const seen = new Set();
        combinedRaw = combinedRaw.filter((e) => {
          if (!e || !e.expenseId) return false;
          if (seen.has(e.expenseId)) return false;
          seen.add(e.expenseId);
          return true;
        });
      } else {
        combinedRaw = await fetchFor(status);
      }

      const list = combinedRaw || [];

      // If the backend returned an empty list for 'all' it can be caused by
      // department-scoped queries returning nothing (e.g. expense has no
      // department). In that case we shouldn't wipe out the current in-memory
      // list (which may contain the optimistic update). Keep the existing
      // expenses when asking for 'all' and the result is empty.
      if (status === "all" && (!list || list.length === 0)) {
        console.warn('loadManagerExpenses: empty result for "all", keeping existing expenses');
        set({ loading: false });
        return get().expenses || [];
      }

      // fetch maps
      if (!get().categories.length) await get().fetchCategories();
      if (!get().departments.length) await get().fetchDepartments();
      const catMap = (get().categories || []).reduce((m, c) => { m[c.categoryId] = c.name; return m; }, {});
      const deptMap = (get().departments || []).reduce((m, d) => { m[d.departmentId] = d.name; return m; }, {});

      // fetch users so we can show employee names instead of ids
      let users = [];
      try {
        const uRes = await apiFetch('/api/users/employees');
        users = Array.isArray(uRes) ? uRes : uRes?.body || [];
      } catch (e) {
        // ignore - if we can't fetch users we'll fallback to userId
        console.warn('Could not load users for name mapping', e);
        users = [];
      }

      const userMap = (users || []).reduce((m, u) => { m[u.userId] = u.name || u.email; return m; }, {});

      const mapped = list.map((e) => ({
        id: e.expenseId,
        employeeName: userMap[e.userId] || (e.userId || ""),
        dept: deptMap[e.departmentId] || e.departmentId,
        category: catMap[e.categoryId] || e.categoryId,
        amount: e.amount,
  description: e.description,
  receipt: e.receiptUrl || e.receipt || null,
        date: e.date,
        status: e.status || "Pending",
        message: e.status ? (e.status.toLowerCase().includes("approve") ? "Approved by Manager" : (e.status.toLowerCase().includes("decline") || e.status.toLowerCase().includes("reject") ? "Rejected by Manager" : e.status)) : "Pending Review",
      }));

  set({ expenses: mapped, loading: false });
  return mapped;
    } catch (err) {
      set({ expenses: [], loading: false });
      throw err;
    }
  },

  // Add a new expense (employee) — POST to backend and append to list
  addExpense: async (exp) => {
    try {
      // ensure categories loaded
      if (!get().categories.length) await get().fetchCategories();
      // If a file is provided, use multipart upload
      let created;
      if (exp.receiptFile) {
        const fd = new FormData();
        // category may be id already
        if (typeof exp.category === "number") fd.append("categoryId", String(exp.category));
        else if (exp.category) fd.append("categoryId", String(exp.category));
        fd.append("amount", String(exp.amount));
        fd.append("date", exp.date);
        if (exp.description) fd.append("description", exp.description);
        fd.append("receipt", exp.receiptFile);

        const res = await apiUpload("/api/expenses", fd, { method: "POST" });
        created = Array.isArray(res) ? res[0] : res?.body || res;
      } else {
        // try to map category name to id
        let categoryId = null;
        if (typeof exp.category === "number") categoryId = exp.category;
        else if (exp.category) {
          const found = (get().categories || []).find((c) => c.name === exp.category);
          categoryId = found ? found.categoryId : null;
        }

        const payload = {
          categoryId,
          amount: parseFloat(exp.amount),
          date: exp.date,
          description: exp.description,
        };

        const res = await apiFetch("/api/expenses", { method: "POST", body: JSON.stringify(payload) });
        created = Array.isArray(res) ? res[0] : res?.body || res;
      }

      // map to UI item and prepend
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const catMap = (get().categories || []).reduce((m, c) => { m[c.categoryId] = c.name; return m; }, {});
      const deptMap = (get().departments || []).reduce((m, d) => { m[d.departmentId] = d.name; return m; }, {});

      const item = {
        id: created?.expenseId,
        employeeName: user?.name || user?.email || "You",
        dept: deptMap[created?.departmentId] || created?.departmentId,
        category: catMap[created?.categoryId] || created?.categoryId,
        amount: created?.amount,
        description: created?.description,
        receipt: created?.receiptUrl || null,
        date: created?.date,
        status: created?.status || "Pending",
        message: created?.status ? (created?.status.toLowerCase().includes("approve") ? "Approved by Manager" : created?.status) : "Pending Review",
      };

      set((s) => ({ expenses: [item, ...s.expenses] }));
      return item;
    } catch (err) {
      console.error("addExpense failed", err);
      throw err;
    }
  },

  // Manager: approve/reject (calls backend then update local state)
  updateExpenseStatus: async (id, status, message) => {
    try {
      console.log('expenseStore.updateExpenseStatus: sending', { id, status, message });
      const resp = await apiFetch(`/api/expenses/approve/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      console.log('expenseStore.updateExpenseStatus: response', resp);
      // optimistic local update
      set((s) => ({ expenses: s.expenses.map((exp) => (exp.id === id ? { ...exp, status, message } : exp)) }));
      // refresh manager list so server-side filters and statuses are reflected
      try {
        const role = (localStorage.getItem('role') || '').toLowerCase();
        if (role === 'manager') await get().loadManagerExpenses('all');
      } catch (e) {
        console.warn('Failed to refresh manager expenses after status update', e);
      }
    } catch (err) {
      console.error("updateExpenseStatus failed", err);
      throw err;
    }
  },
}));
