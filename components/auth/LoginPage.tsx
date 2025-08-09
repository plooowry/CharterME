
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PageTitle from '../core/PageTitle';
import LoadingSpinner from '../core/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg-base dark:bg-dark-theme-bg-base py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-10 rounded-xl shadow-2xl">
        <div>
          <PageTitle title="Login to CharterMe" subtitle="Access your personalized CEng application assistant."/>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-theme-accent-red dark:text-dark-theme-accent-red text-sm bg-red-100 dark:bg-dark-theme-accent-red/10 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-theme-bg-muted dark:bg-dark-theme-bg-muted border border-theme-border dark:border-dark-theme-border placeholder-theme-text-muted dark:placeholder-dark-theme-text-muted text-theme-text-base dark:text-dark-theme-text-base rounded-t-md focus:outline-none focus:ring-theme-primary dark:focus:ring-dark-theme-primary focus:border-theme-primary dark:focus:border-dark-theme-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-theme-bg-muted dark:bg-dark-theme-bg-muted border border-theme-border dark:border-dark-theme-border placeholder-theme-text-muted dark:placeholder-dark-theme-text-muted text-theme-text-base dark:text-dark-theme-text-base rounded-b-md focus:outline-none focus:ring-theme-primary dark:focus:ring-dark-theme-primary focus:border-theme-primary dark:focus:border-dark-theme-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-theme-primary dark:bg-dark-theme-primary hover:bg-theme-primary/80 dark:hover:bg-dark-theme-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary disabled:bg-theme-bg-muted dark:disabled:bg-dark-theme-bg-muted disabled:text-theme-text-muted dark:disabled:text-dark-theme-text-muted"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </div>
        </form>
         <p className="mt-4 text-center text-sm text-theme-text-muted dark:text-dark-theme-text-muted">
            (Demo: any email/password will work)
          </p>
      </div>
    </div>
  );
};

export default LoginPage;
