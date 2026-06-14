import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoreInfo } from '../api/index.js';

export default function Footer() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    getStoreInfo()
      .then((res) => setStore(res.data))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-brand-800 text-brand-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-3 gap-6 text-sm">
        <div>
          <h3 className="font-bold text-lg mb-2">VJ Fashions</h3>
          <p className="text-brand-200">
            Quality newborn & kids wear in Chirala. Skin-friendly fabrics, trusted by local families.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-brand-200">
            <li><Link to="/shop" className="hover:text-white">Shop Catalog</Link></li>
            <li><Link to="/contact" className="hover:text-white">Store Details</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Visit Us</h4>
          <p className="text-brand-200">{store?.address || 'Chirala, Andhra Pradesh'}</p>
          <p className="text-brand-200 mt-1">{store?.hours || '10:00 AM – 9:00 PM (Daily)'}</p>
        </div>
      </div>
      <div className="border-t border-brand-700 text-center py-4 text-brand-300 text-xs">
        © {new Date().getFullYear()} VJ Fashions. All rights reserved.
      </div>
    </footer>
  );
}
