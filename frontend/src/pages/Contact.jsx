import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { getStoreInfo } from '../api/index.js';
import { WHATSAPP_NUMBER } from '../config/constants.js';

export default function Contact() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    getStoreInfo()
      .then((res) => setStore(res.data))
      .catch(() => {});
  }, []);

  const whatsapp = store?.whatsapp || WHATSAPP_NUMBER;
  const waLink = whatsapp && !whatsapp.includes('[')
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Visit VJ Fashions</h1>
        <p className="text-gray-600 mb-8">
          Come see our collection in person or message us on WhatsApp for availability.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-brand-100 p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-800">Address</h2>
              <p className="text-gray-600 mt-1">{store?.address || '[Store address — to be added]'}</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Phone</h2>
              <p className="text-gray-600 mt-1">{store?.phone || '[Phone number — to be added]'}</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Working Hours</h2>
              <p className="text-gray-600 mt-1">{store?.hours || '[Working hours — to be added]'}</p>
            </div>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600"
              >
                💬 Chat on WhatsApp
              </a>
            )}
          </div>

          <div className="bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center min-h-[280px] text-gray-500 text-sm p-6 text-center">
            {store?.mapEmbedUrl && !store.mapEmbedUrl.includes('[') ? (
              <iframe
                title="Store location"
                src={store.mapEmbedUrl}
                className="w-full h-full min-h-[280px] rounded-xl border-0"
                loading="lazy"
              />
            ) : (
              <p>[Google Maps embed — to be added]</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
