import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts, getStoreInfo } from '../api/index.js';
import { CATEGORIES } from '../config/constants.js';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [store, setStore] = useState(null);

  useEffect(() => {
    getProducts({ available: 'true' })
      .then((res) => setFeatured(res.data.slice(0, 4)))
      .catch(() => {});
    getStoreInfo()
      .then((res) => setStore(res.data))
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <section className="bg-gradient-to-br from-brand-100 via-cream to-mint">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-brand-600 font-medium mb-2">Chirala&apos;s trusted kids store</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
              Soft, safe &amp; stylish for little ones
            </h1>
            <p className="text-gray-600 mt-4 text-lg">
              Browse our digital catalog of newborn essentials, toddler wear, and gift sets.
              Inquire instantly on WhatsApp — no checkout needed.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                to="/shop"
                className="px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition"
              >
                Browse Catalog
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border border-brand-300 text-brand-700 rounded-xl font-medium hover:bg-brand-50 transition"
              >
                Visit Our Store
              </Link>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-3xl p-8 border border-brand-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">Why families choose us</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-2"><span className="text-brand-500">✓</span> 100% cotton &amp; skin-friendly fabrics</li>
              <li className="flex gap-2"><span className="text-brand-500">✓</span> Age-appropriate sizing (0–6 years)</li>
              <li className="flex gap-2"><span className="text-brand-500">✓</span> Local store in Chirala — visit or inquire online</li>
            </ul>
            {store && (
              <p className="mt-4 text-sm text-gray-500 border-t border-brand-100 pt-4">
                📍 {store.address}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className="bg-white border border-brand-100 rounded-xl p-4 text-center hover:border-brand-300 hover:shadow-sm transition"
            >
              <span className="font-medium text-gray-700">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
            <Link to="/shop" className="text-brand-600 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
