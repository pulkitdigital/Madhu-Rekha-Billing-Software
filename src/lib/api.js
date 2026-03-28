// // src/lib/api.js

// export const API_BASE =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export async function apiFetch(path, options = {}) {
//   const res = await fetch(`${API_BASE}${path}`, {
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//     },
//     ...options,
//   });

//   let data = null;
//   try {
//     data = await res.json();
//   } catch {
//     data = null;
//   }

//   if (!res.ok) {
//     const message =
//       data?.error ||
//       data?.message ||
//       `API Error: ${res.status} ${res.statusText}`;
//     throw new Error(message);
//   }

//   return data;
// }



// src/lib/api.js

// ✅ Electron mein file:// protocol hota hai → local backend
// ✅ Website mein https:// hota hai → deployed backend (Render/Railway)
const isElectron = window.location.protocol === "file:";

export const API_BASE = isElectron
  ? "http://localhost:4000"                          // Electron: local Express
  : import.meta.env.VITE_API_BASE_URL || "https://madhu-rekha-billing-backend-1.onrender.com"; // Website: Render URL

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `API Error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data;
}