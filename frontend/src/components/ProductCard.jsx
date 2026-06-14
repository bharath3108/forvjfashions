import { Link } from 'react-router-dom';
import { buildImageUrl } from '../utils/cloudinary.js';

export default function ProductCard({ product }) {
  const imgId = product.imgIds?.[0];

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-100 hover:shadow-md transition"
    >
      <div className="aspect-square bg-cream overflow-hidden">
        <img
          src={buildImageUrl(imgId, 400)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
          {!product.isAvailable && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
              Out of Stock
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {product.category} · {product.ageGroup}
        </p>
        <p className="text-brand-600 font-bold mt-2">₹{product.price}</p>
      </div>
    </Link>
  );
}
