// Small fetch wrapper that attaches Authorization header when token present
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let errBody;
    try {
      const j = await res.json();
      errBody = j?.message || JSON.stringify(j);
    } catch {
      errBody = await res.text();
    }
    const err = new Error(errBody || "API error");
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// upload helper for multipart/form-data. Accepts a FormData instance.
export async function apiUpload(path, formData, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: options.method || "POST", body: formData, headers });

  if (!res.ok) {
    let errBody;
    try {
      const j = await res.json();
      errBody = j?.message || JSON.stringify(j);
    } catch {
      errBody = await res.text();
    }
    const err = new Error(errBody || "API error");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// fetch a binary resource (image/pdf/etc) and return its blob and content-type
export async function apiFetchBlob(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let errBody;
    try {
      const j = await res.json();
      errBody = j?.message || JSON.stringify(j);
    } catch {
      errBody = await res.text();
    }
    const err = new Error(errBody || "API error");
    err.status = res.status;
    throw err;
  }

  const blob = await res.blob();
  const contentType = res.headers.get("content-type") || blob.type;
  return { blob, contentType };
}
