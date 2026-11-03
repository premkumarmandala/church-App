import { useState } from 'react';
import { apiService } from '../services/api.js';

/**
 * Pastoral Administrator & Master CMS Sign-In View
 * Authenticates church administrators and issues JWT Bearer tokens.
 * Features password visibility toggle, accessible error states, loading spinner,
 * and quick return link to the public website.
 */
export function LoginView({ onLoginSuccess }) {
  const useSafeState = typeof useState !== 'undefined' ? useState : (window.React ? window.React.useState : null);
  const api = window.cmsApi || window.apiService || apiService;

  const [username, setUsername] = useSafeState('pastor');
  const [password, setPassword] = useSafeState('');
  const [showPassword, setShowPassword] = useSafeState(false);
  const [isLoading, setIsLoading] = useSafeState(false);
  const [errorMessage, setErrorMessage] = useSafeState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both administrator username and password.');
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
      {/* Return to Public Website */}
      <a href="/" className="login-back-link" title="Return to Grace Church Homepage">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Back to Church Website</span>
      </a>

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-crest" aria-hidden="true">✝</div>
          <h1 className="login-title">Grace Fellowship Church</h1>
          <p className="login-subtitle">Central Content Management & Pastoral Administration</p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="login-error-banner" role="alert" aria-live="assertive">
            <svg className="login-error-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">
              Administrator Username
            </label>
            <input
              id="admin-username"
              type="text"
              name="username"
              autoComplete="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. pastor"
              required
              disabled={isLoading}
              aria-invalid={Boolean(errorMessage)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Pastoral Password
            </label>
            <div className="password-input-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isLoading}
                aria-invalid={Boolean(errorMessage)}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  /* Eye-off SVG */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye SVG */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="login-spinner-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        {/* Development & Demo Credentials Helper */}
        <details className="login-hint-details">
          <summary className="login-hint-summary">
            <span>Development Credentials Helper</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="login-hint-content">
            <div>Username: <code>pastor</code></div>
            <div style={{ marginTop: '4px' }}>Password: <code>GraceChurch2026!</code></div>
            <button
              type="button"
              className="btn-demo-fill"
              onClick={handleFillDemo}
            >
              Fill Demo Credentials
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.LoginView = LoginView;
}
