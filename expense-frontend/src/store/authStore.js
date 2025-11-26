import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  username: localStorage.getItem("username") || null,
  role: localStorage.getItem("role") || null,
  token: localStorage.getItem("token") || null,

  // login: call backend, store token/user/role
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.message || "Login failed";
      throw new Error(msg);
    }

    // backend returns ApiResponse.body = LoginResponse { token, user }
    const loginResp = json?.body;
    const token = loginResp?.token;
    const user = loginResp?.user;

    // normalize role (backend stores enum like MANAGER)
    let role = null;
    if (user?.role) {
      role = String(user.role).toLowerCase();
    } else {
      role = email.toLowerCase().includes("manager") ? "manager" : "employee";
    }

    if (token) localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      // store a simple username for UI filters (fallback to email)
      const uname = user.name || user.email || "";
      localStorage.setItem("username", uname);
      // update store field as well
      set((s) => ({ ...s, username: uname }));
    }
    if (role) localStorage.setItem("role", role);

    set({ user, role, token });

    return { user, role, token };
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    set({ user: null, role: null, token: null });
  },
}));
