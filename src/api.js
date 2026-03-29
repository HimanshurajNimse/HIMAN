const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || process.env.VITE_API_URL || 'http://localhost:4000';

async function http(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let errText = '';
    try { errText = await res.text(); } catch {}
    throw new Error(errText || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login(username, password, role) {
    return http('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password, role }) });
  },
  register(name, email, password, role) {
    return http('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
  },
  getRecords(userId) {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return http(`/api/records${q}`);
  },
  createRecord(ownerUserId, name, type, url) {
    return http('/api/records', { method: 'POST', body: JSON.stringify({ ownerUserId, name, type, url }) });
  },
  generateToken(recordId) {
    return http('/api/tokens/generate', { method: 'POST', body: JSON.stringify({ recordId }) });
  },
  redeemToken(token) {
    return http('/api/tokens/redeem', { method: 'POST', body: JSON.stringify({ token }) });
  },
  getLogs() {
    return http('/api/logs');
  },
  addLog(user, action, accessLevel = 'Viewer') {
    return http('/api/logs', { method: 'POST', body: JSON.stringify({ user, action, accessLevel }) });
  },
};