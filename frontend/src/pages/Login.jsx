import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { userLogin, resendVerification } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/errors.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInUnverified, setLoggedInUnverified] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setDevLink('');
    setLoggedInUnverified(false);
    try {
      const res = await userLogin(form);
      login(res.data.token, res.data.user);
      if (!res.data.user.isVerified) {
        setLoggedInUnverified(true);
        setMessage('Logged in, but your email is not verified yet. Check your inbox or resend the link below.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendVerification(form.email);
      setMessage(res.data.message);
      if (res.data.devVerifyUrl) setDevLink(res.data.devVerifyUrl);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not resend link'));
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-brand-100 p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && (
            <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              {message}
            </p>
          )}
          {devLink && (
            <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-blue-800 font-medium">Dev mode — click to verify your email:</p>
              <a href={devLink} className="block text-brand-600 underline break-all font-medium">
                Verify my email
              </a>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {loggedInUnverified && (
          <div className="mt-4 text-center space-y-2">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-brand-600 hover:underline"
            >
              Resend verification link
            </button>
            <p>
              <Link to="/shop" className="text-sm text-gray-600 hover:underline">
                Continue browsing without verifying →
              </Link>
            </p>
          </div>
        )}
        <p className="text-center text-sm text-gray-600 mt-4">
          No account?{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:underline">
            Register
          </Link>
        </p>
        {form.email && !loggedInUnverified && (
          <button
            type="button"
            onClick={handleResend}
            className="block mx-auto mt-3 text-sm text-brand-600 hover:underline"
          >
            Resend verification link
          </button>
        )}
      </div>
    </Layout>
  );
}
