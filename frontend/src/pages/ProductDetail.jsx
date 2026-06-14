import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import CommentSection from '../components/CommentSection.jsx';
import { getProduct, getStoreInfo } from '../api/index.js';
import { buildImageUrl, buildWhatsAppLink } from '../utils/cloudinary.js';
import { WHATSAPP_NUMBER } from '../config/constants.js';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState(WHATSAPP_NUMBER);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreInfo()
      .then((res) => {
        if (res.data?.whatsapp && !res.data.whatsapp.includes('[')) {
          setWhatsappNumber(res.data.whatsapp);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getProduct(id)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-gray-500">Loading...</div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-gray-500">Product not found.</div>
      </Layout>
    );
  }

  const whatsappLink = buildWhatsAppLink(product, whatsappNumber);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-brand-100">
              <img
                src={buildImageUrl(product.imgIds[activeImg], 700)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.imgIds.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.imgIds.map((imgId, i) => (
                  <button
                    key={imgId}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      i === activeImg ? 'border-brand-500' : 'border-transparent'
                    }`}
                  >
                    <img src={buildImageUrl(imgId, 100)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-brand-600 font-medium">
              {product.category} · {product.ageGroup}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
            <p className="text-2xl font-bold text-brand-600 mt-3">₹{product.price}</p>
            <span
              className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                product.isAvailable
                  ? 'bg-mint text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {product.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>

            <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

            {product.sizes?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Available Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <span key={s} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition"
            >
              <span>💬</span> Inquire on WhatsApp
            </a>
          </div>
        </div>

        <CommentSection productId={product._id} />
      </div>
    </Layout>
  );
}
