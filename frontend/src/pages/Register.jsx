import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { userRegister, resendVerification } from '../api/index.js';
import { getErrorMessage } from '../utils/errors.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setDevLink('');
    try {
      const res = await userRegister(form);
      setMessage(res.data.message);
      if (res.data.devVerifyUrl) setDevLink(res.data.devVerifyUrl);
    } catch (err) {
      const msg = getErrorMessage(err, 'Registration failed');
      if (msg.includes('already registered')) {
        setError(`${msg}. Try resending verification link below.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-brand-100 p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && (
            <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
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
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Login
          </Link>
        </p>
        {form.email && (
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await resendVerification(form.email);
                setMessage(res.data.message);
                if (res.data.devVerifyUrl) setDevLink(res.data.devVerifyUrl);
                setError('');
              } catch (err) {
                setError(getErrorMessage(err, 'Could not resend link'));
              }
            }}
            className="block mx-auto mt-3 text-sm text-brand-600 hover:underline"
          >
            Resend verification link
          </button>
        )}
      </div>
    </Layout>
  );
}
