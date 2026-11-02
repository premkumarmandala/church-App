import { useState } from 'react';
import { apiService } from '../services/api.js';

/**
 * Pastoral Administrator Sign-In View
 * Authenticates church administrators and issues JWT Bearer tokens.
 */

export function LoginView({ onLoginSuccess }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const api = window.apiService || apiService;
  const [username, setUsername] = useSafeState('pastor');
  const [password, setPassword] = useSafeState('');
  const [isLoading, setIsLoading] = useSafeState(false);
  const [errorMessage, setErrorMessage] = useSafeState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await api.login(username.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('pastor');
    setPassword('GraceChurch2026!');
    setErrorMessage('');
  };

  return (
    <div className="login-canvas">
      <div className="login-card">
        <div className="login-brand-header">
          <div className="login-crest">✝</div>
          <h1 className="login-title">Grace Fellowship Church</h1>
          <p className="login-subtitle">Pastoral Care & Prayer Request Administration</p>
        </div>

        {errorMessage && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">
              Administrator Username
            </label>
            <input
              id="admin-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. pastor"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Pastoral Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="login-hint">
          <div style={{ marginBottom: '6px' }}>
            <strong>Default Pastoral Credentials:</strong>
          </div>
          <div>User: <code>pastor</code></div>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleFillDemo}
            style={{ margin: '8px auto 0', fontSize: '0.75rem', padding: '4px 10px' }}
          >
            Fill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.LoginView = LoginView;
}
