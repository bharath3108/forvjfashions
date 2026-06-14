import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  createAdmin,
  getAllComments,
  deleteComment
} from '../../api/index.js';
import { CATEGORIES, AGE_GROUPS } from '../../config/constants.js';
import { buildImageUrl } from '../../utils/cloudinary.js';
import { getErrorMessage } from '../../utils/errors.js';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Newborn',
  ageGroup: '0-1y',
  sizes: '',
  imgIds: [],
  isAvailable: true
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [comments, setComments] = useState([]);

  const loadProducts = () => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err.response?.status === 401) navigate('/admin');
        else setError(getErrorMessage(err, 'Failed to load products'));
      });
  };

  const loadComments = () => {
    getAllComments()
      .then((res) => setComments(res.data))
      .catch((err) => {
        if (err.response?.status === 401) navigate('/admin');
      });
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin');
      return;
    }
    loadProducts();
    loadComments();
  }, [navigate]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadImage(file);
      setForm((f) => ({ ...f, imgIds: [...f.imgIds, res.data.imgId] }));
      setSuccess('Image uploaded successfully');
    } catch (err) {
      setError(getErrorMessage(err, 'Image upload failed'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.imgIds.length === 0) {
      setError('Please upload at least one image before saving');
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : []
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setSuccess('Product updated successfully');
      } else {
        await createProduct(payload);
        setSuccess('Product created successfully');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, 'Save failed'));
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setError('');
    setSuccess('');
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      ageGroup: p.ageGroup,
      sizes: p.sizes?.join(', ') || '',
      imgIds: p.imgIds || [],
      isAvailable: p.isAvailable
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setSuccess('Product deleted');
      loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, 'Delete failed'));
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const { username } = newAdmin;
    try {
      await createAdmin(newAdmin);
      setNewAdmin({ username: '', password: '' });
      setSuccess(`Admin "${username}" created`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create admin'));
    }
  };

  const handleDeleteComment = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(id);
      setSuccess('Comment deleted');
      loadComments();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete comment'));
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
        <h1 className="font-bold">VJ Fashions Admin</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/" className="hover:underline">View Site</Link>
          <button onClick={logout} className="hover:underline">Logout</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-lg mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <input
              placeholder="Product name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <textarea
              placeholder="Description"
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              required
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border rounded-lg px-3 py-2"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={form.ageGroup}
                onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                className="border rounded-lg px-3 py-2"
              >
                {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <input
              placeholder="Sizes (comma-separated, e.g. S, M, L)"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              />
              In Stock
            </label>
            <div>
              <label className="block mb-1 font-medium">Images (required)</label>
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
              {form.imgIds.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.imgIds.map((imgId) => (
                    <div key={imgId} className="relative">
                      <img
                        src={buildImageUrl(imgId, 80)}
                        alt=""
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          imgIds: f.imgIds.filter((id) => id !== imgId)
                        }))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
            {success && <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">{success}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setForm(emptyForm); setError(''); setSuccess(''); }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">Products ({products.length})</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet. Add your first product on the left.</p>
            ) : (
              <ul className="space-y-2 max-h-96 overflow-y-auto text-sm">
                {products.map((p) => (
                  <li key={p._id} className="flex justify-between items-center border-b pb-2 gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {p.imgIds?.[0] && (
                        <img src={buildImageUrl(p.imgIds[0], 40)} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      )}
                      <span className="truncate">{p.name} — ₹{p.price}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(p)} className="text-blue-600">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">Add Admin</h2>
            <form onSubmit={handleCreateAdmin} className="flex gap-2 text-sm">
              <input
                placeholder="Username"
                required
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg">Add</button>
            </form>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">Comments ({comments.length})</h2>
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto text-sm">
                {comments.map((c) => (
                  <li key={c._id} className="border-b pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.userName} on {c.productName}</p>
                        <p className="text-gray-600 mt-0.5">{c.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-red-600 shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
