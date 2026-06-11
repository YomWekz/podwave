/**
 * Public Auth Service
 * Handles authentication for public users
 * 
 * Features:
 * - Registration
 * - Login
 * - Logout
 * - Token management
 * - User info storage
 * - Auth state helpers
 */

const API_BASE_URL = 'http://localhost:4003/api';

// LocalStorage keys
const TOKEN_KEY = 'public_auth_token';
const USER_KEY = 'public_user';

// Custom event for auth state changes
export const AUTH_REQUIRED_EVENT = 'auth:required';
export const AUTH_SUCCESS_EVENT = 'auth:success';
export const AUTH_LOGOUT_EVENT = 'auth:logout';

// ============================================
// Token Management
// ============================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ============================================
// User Info Management
// ============================================

export function getUser() {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Failed to parse stored user:', e);
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// ============================================
// Auth State Helpers
// ============================================

export function isAuthenticated() {
  return !!getToken();
}

export function getAuthHeaders() {
  const token = getToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`
  };
}

export function clearInvalidToken() {
  clearToken();
  clearUser();
  
  // Dispatch auth required event
  window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT));
}

// ============================================
// API Requests with Auth
// ============================================

async function authRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    
    // Handle 401 Unauthorized - token is invalid or expired
    if (response.status === 401) {
      clearInvalidToken();
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Auth request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// ============================================
// Auth Actions
// ============================================

/**
 * Register a new public user
 */
export async function register(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    if (!data.success || !data.token) {
      throw new Error('Invalid registration response');
    }
    
    // Store token and user
    setToken(data.token);
    setUser(data.user);
    
    // Dispatch success event
    window.dispatchEvent(new CustomEvent(AUTH_SUCCESS_EVENT, { 
      detail: { user: data.user } 
    }));
    
    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Login existing public user
 */
export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    if (!data.success || !data.token) {
      throw new Error('Invalid login response');
    }
    
    // Store token and user
    setToken(data.token);
    setUser(data.user);
    
    // Dispatch success event
    window.dispatchEvent(new CustomEvent(AUTH_SUCCESS_EVENT, { 
      detail: { user: data.user } 
    }));
    
    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Logout current user
 */
export function logout() {
  clearToken();
  clearUser();
  
  // Dispatch logout event
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
}

/**
 * Verify current token is still valid
 */
export async function verifyToken() {
  if (!isAuthenticated()) {
    return { valid: false };
  }
  
  try {
    const data = await authRequest('/auth/verify');
    
    if (data.success && data.valid) {
      // Update stored user info if provided
      if (data.user) {
        setUser(data.user);
      }
      return { valid: true, user: data.user };
    }
    
    return { valid: false };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Get current user profile (requires auth)
 */
export async function getCurrentUser() {
  return authRequest('/user/profile');
}

export default {
  // Token management
  getToken,
  setToken,
  clearToken,
  
  // User management
  getUser,
  setUser,
  clearUser,
  
  // Auth state
  isAuthenticated,
  getAuthHeaders,
  clearInvalidToken,
  
  // Auth actions
  register,
  login,
  logout,
  verifyToken,
  getCurrentUser,
  
  // Events
  AUTH_REQUIRED_EVENT,
  AUTH_SUCCESS_EVENT,
  AUTH_LOGOUT_EVENT
};
