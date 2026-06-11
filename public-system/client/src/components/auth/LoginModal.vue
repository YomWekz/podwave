<!--
  Login Modal Component
  Allows public users to log in
-->

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <!-- Close button -->
      <button class="modal-close" @click="$emit('close')">
        <i class="ti ti-x"></i>
      </button>

      <!-- Header -->
      <div class="modal-header">
        <div class="logo-area">
          <div class="logo-icon">
            <i class="ti ti-radio"></i>
          </div>
          <h2>Welcome Back</h2>
        </div>
        <p class="modal-subtitle">Sign in to access your saved podcasts and history</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <!-- Email -->
        <div class="form-group">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            :disabled="loading"
            autocomplete="email"
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            :disabled="loading"
            autocomplete="current-password"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <i class="ti ti-alert-circle"></i>
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="ti ti-loader spin"></i>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Signup Link -->
      <div class="modal-footer">
        <p>
          Don't have an account?
          <a href="#" @click.prevent="$emit('switch-to-signup')" class="link">Sign up</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as auth from '../../services/auth';

// Emits
const emit = defineEmits(['close', 'switch-to-signup', 'login-success']);

// Form state
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  // Clear previous error
  error.value = '';
  
  // Validate
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password';
    return;
  }
  
  loading.value = true;
  
  try {
    const result = await auth.login(email.value, password.value);
    
    if (result.success) {
      emit('login-success', result.user);
      emit('close');
    } else {
      error.value = result.error || 'Login failed';
    }
  } catch (err) {
    error.value = 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-card {
  background: var(--surface);
  border-radius: 16px;
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  max-width: 420px;
  width: 100%;
  position: relative;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 18px;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}

.modal-header {
  padding: 32px 32px 24px;
  border-bottom: 0.5px solid var(--border2);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.modal-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

.auth-form {
  padding: 24px 32px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input {
  width: 100%;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text);
  font-size: 14px;
  transition: all 0.15s ease;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.05);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group input::placeholder {
  color: var(--text-dim);
}

.error-message {
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 0.5px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #ef4444;
  font-size: 13px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-message i {
  font-size: 16px;
}

.btn-primary {
  width: 100%;
  padding: 13px;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.modal-footer {
  padding: 20px 32px 32px;
  text-align: center;
  border-top: 0.5px solid var(--border2);
}

.modal-footer p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .modal-card {
    max-width: 100%;
    margin: 0 16px;
  }

  .modal-header,
  .auth-form,
  .modal-footer {
    padding-left: 24px;
    padding-right: 24px;
  }
}
</style>
