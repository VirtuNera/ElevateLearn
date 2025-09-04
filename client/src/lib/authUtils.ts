export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/api/auth/user`, {
    credentials: 'include',   // if you use cookies/sessions
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}