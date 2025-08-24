export type UserRole = 'patient' | 'doctor';

const BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || process.env.VITE_API_URL || 'http://localhost:4000';

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (username: string, password: string, role: UserRole) =>
    http<{ user: { id: string; name: string; email: string; role: UserRole } }>(`/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),

  register: (name: string, email: string, password: string, role: UserRole) =>
    http<{ user: { id: string; name: string; email: string; role: UserRole } }>(`/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  // Records
  getRecords: (userId?: string) =>
    http<{ records: Array<{ id: string; ownerUserId: string; name: string; date: string; type: string; status: string; url: string }> }>(`/api/records${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`),

  createRecord: (ownerUserId: string, name: string, type?: string, url?: string) =>
    http<{ record: any }>(`/api/records`, {
      method: 'POST',
      body: JSON.stringify({ ownerUserId, name, type, url }),
    }),

  // Tokens
  generateToken: (recordId: string) =>
    http<{ token: string; expiresIn: number }>(`/api/tokens/generate`, {
      method: 'POST',
      body: JSON.stringify({ recordId }),
    }),

  redeemToken: (token: string) =>
    http<{ record: any }>(`/api/tokens/redeem`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // Logs
  getLogs: () => http<{ logs: Array<{ user: string; action: string; accessLevel: string; timestamp: string }> }>(`/api/logs`),

  addLog: (user: string, action: string, accessLevel = 'Viewer') =>
    http<{ log: { user: string; action: string; accessLevel: string; timestamp: string } }>(`/api/logs`, {
      method: 'POST',
      body: JSON.stringify({ user, action, accessLevel }),
    }),
};