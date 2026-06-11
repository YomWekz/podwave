'use client';

const AUTH_API_URL = 'http://localhost:3002/api/auth';
const TOKEN_KEY = 'podwave_editor_token';

export const AUTH_REQUIRED_EVENT = 'podwave-editor:auth-required';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded));
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

  getStorage()?.setItem(TOKEN_KEY, data.token);
  return data;
}

export function logout({ notify = false } = {}) {
  getStorage()?.removeItem(TOKEN_KEY);

  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
  }
}

export function clearInvalidToken() {
  logout({ notify: true });
}

export function getToken() {
  return getStorage()?.getItem(TOKEN_KEY) || null;
}

export function isAuthenticated() {
  const token = getToken();

  if (!token) {
    return false;
  }

  const payload = decodeTokenPayload(token);
  if (!payload?.exp || payload.exp * 1000 <= Date.now() || payload.role !== 'editor') {
    clearInvalidToken();
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
  clearInvalidToken,
};
