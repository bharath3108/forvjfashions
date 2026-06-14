import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getComments, addComment } from '../api/index.js';
import { Link } from 'react-router-dom';

export default function CommentSection({ productId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getComments(productId)
      .then((res) => setComments(res.data))
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await addComment(productId, text.trim());
      setComments((prev) => [res.data, ...prev]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 bg-white rounded-2xl border border-brand-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Comments</h2>

      {!user ? (
        <p className="text-sm text-gray-600 mb-4">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Log in
          </Link>{' '}
          to leave a comment.
        </p>
      ) : !user.isVerified ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          Please verify your email before commenting. Check your inbox for the verification link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this product..."
            maxLength={500}
            rows={3}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="mt-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c._id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">{c.userName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
