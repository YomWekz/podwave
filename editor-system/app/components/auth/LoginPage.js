'use client';

import { useState } from 'react';
import { login } from '../../services/auth';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('editor');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      onLogin();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.brand}>
          <div className={styles.logo}>pod<span>wave</span></div>
          <div className={styles.role}>Editor workspace</div>
        </div>

        <div className={styles.heading}>
          <h1>Editor sign in</h1>
          <p>Use your Editor credentials to review, curate, and publish podcasts.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="editor-username">Username</label>
          <input
            id="editor-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <label htmlFor="editor-password">Password</label>
          <input
            id="editor-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            autoFocus
            required
          />

          {error && <div className={styles.error} role="alert">{error}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
