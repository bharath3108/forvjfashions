import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts, searchProducts } from '../api/index.js';
import { CATEGORIES, AGE_GROUPS } from '../config/constants.js';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const category = searchParams.get('category') || '';
  const ageGroup = searchParams.get('ageGroup') || '';

  useEffect(() => {
    const q = searchParams.get('q');
    setLoading(true);

    const fetcher = q
      ? searchProducts(q, {
          ...(category && { category }),
          ...(ageGroup && { ageGroup })
        })
      : getProducts({
          ...(category && { category }),
          ...(ageGroup && { ageGroup })
        });

    fetcher
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, ageGroup, searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchQuery.trim()) next.set('q', searchQuery.trim());
    else next.delete('q');
    setSearchParams(next);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Shop Catalog</h1>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products (e.g. romper, frock)..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => updateFilter('ageGroup', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Ages</option>
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products found. Try different filters.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
