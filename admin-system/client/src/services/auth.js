const AUTH_API_URL = 'http://localhost:4001/api/auth';
const TOKEN_KEY = 'podwave_admin_token';

export const AUTH_REQUIRED_EVENT = 'podwave:auth-required';

function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export async function login(username, password) {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.token) {
    throw new Error(data.error || 'Login failed. Check your username and password.');
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export function logout({ notify = false } = {}) {
  localStorage.removeItem(TOKEN_KEY);

  if (notify) {
    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  const token = getToken();

  if (!token) {
    return false;
  }

  const payload = decodeTokenPayload(token);
  if (!payload?.exp || payload.exp * 1000 <= Date.now()) {
    logout();
    return false;
  }

  return true;
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default {
  login,
  logout,
  getToken,
  isAuthenticated,
  getAuthHeaders,
};
