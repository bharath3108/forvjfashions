import { CLOUDINARY_CLOUD, API_URL } from '../config/constants.js';

const API_BASE = API_URL.replace(/\/api\/?$/, '');

export const buildImageUrl = (imgId, width = 600) => {
  if (!imgId) return '/placeholder-product.svg';

  if (imgId.startsWith('local/')) {
    return `${API_BASE}/uploads/${imgId.replace('local/', '')}`;
  }

  if (!CLOUDINARY_CLOUD || CLOUDINARY_CLOUD.includes('your_')) {
    return '/placeholder-product.svg';
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_webp,w_${width},q_auto/${imgId}`;
};

export const buildWhatsAppLink = (product, whatsappNumber) => {
  const number = (whatsappNumber || '').replace(/\D/g, '');
  if (!number || number.includes('X')) return '#';
  const message = encodeURIComponent(
    `Hi VJ Fashions! I saw "${product.name}" (Product ID: ${product._id}) on your website. Do you have this available for age group ${product.ageGroup}?`
  );
  return `https://wa.me/${number}?text=${message}`;
};
