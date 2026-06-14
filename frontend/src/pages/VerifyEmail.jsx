import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { verifyEmail } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        login(res.data.token, res.data.user);
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [searchParams, login]);

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        {status === 'verifying' && <p className="text-gray-600">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-700 font-medium text-lg">{message}</p>
            <Link to="/shop" className="inline-block mt-4 text-brand-600 font-medium hover:underline">
              Start browsing →
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600 font-medium">{message}</p>
            <Link to="/login" className="inline-block mt-4 text-brand-600 font-medium hover:underline">
              Try logging in
            </Link>
            <Link to="/register" className="inline-block mt-2 ml-4 text-brand-600 font-medium hover:underline">
              Register again
            </Link>
          </>
        )}
      </div>
    </Layout>
  );
}
