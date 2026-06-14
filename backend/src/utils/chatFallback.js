import Product from '../models/Product.js';
import { CATEGORIES } from '../config/constants.js';

const wa = () =>
  `https://wa.me/${(process.env.WHATSAPP_NUMBER || '917799540006').replace(/\D/g, '')}`;

const storeInfo = () => ({
  address: process.env.STORE_ADDRESS || 'Chirala, Andhra Pradesh',
  phone: process.env.STORE_PHONE || '+917799540006',
  hours: process.env.STORE_HOURS || '10:00 AM – 9:00 PM (Daily)',
  whatsapp: wa()
});

const loadProducts = () =>
  Product.find({ isAvailable: true })
    .select('name price category ageGroup description createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

const matches = (text, words) => words.some((w) => text.includes(w));

export const getFallbackReply = async (message) => {
  const q = message.toLowerCase().trim();
  const store = storeInfo();
  const products = await loadProducts();

  if (matches(q, ['hour', 'time', 'open', 'close', 'when'])) {
    return `We're open ${store.hours}. Visit us at ${store.address}, or message us on WhatsApp: ${store.whatsapp}`;
  }

  if (matches(q, ['where', 'address', 'location', 'map', 'find you', 'store'])) {
    return `VJ Fashions is at ${store.address}. Call ${store.phone} or WhatsApp us: ${store.whatsapp}`;
  }

  if (matches(q, ['whatsapp', 'order', 'buy', 'purchase', 'stock', 'available', 'price confirm'])) {
    return `We don't checkout online — browse here, then inquire on WhatsApp for sizes & stock: ${store.whatsapp}`;
  }

  if (matches(q, ['phone', 'call', 'contact'])) {
    return `Phone: ${store.phone} | WhatsApp: ${store.whatsapp} | Hours: ${store.hours}`;
  }

  if (matches(q, ['new', 'latest', 'recent', 'what do you have', 'catalog', 'collection'])) {
    if (!products.length) {
      return `New arrivals are being added soon! Visit our shop in Chirala or WhatsApp us: ${store.whatsapp}`;
    }
    const list = products.slice(0, 5).map((p) => `• ${p.name} — ₹${p.price} (${p.category}, ${p.ageGroup})`).join('\n');
    return `Here's what's in our catalog:\n${list}\n\nFor sizes & stock, WhatsApp: ${store.whatsapp}`;
  }

  if (matches(q, ['category', 'categories', 'newborn', 'toddler', 'kids', 'accessories', 'gift'])) {
    const cat = CATEGORIES.find((c) => q.includes(c.toLowerCase()));
    if (cat) {
      const filtered = products.filter((p) => p.category === cat);
      if (!filtered.length) {
        return `We have a ${cat} section — items are being updated. WhatsApp us for current stock: ${store.whatsapp}`;
      }
      const list = filtered.slice(0, 5).map((p) => `• ${p.name} — ₹${p.price}`).join('\n');
      return `${cat} picks:\n${list}\n\nWhatsApp for availability: ${store.whatsapp}`;
    }
    return `We stock: ${CATEGORIES.join(', ')}. Browse /shop or WhatsApp: ${store.whatsapp}`;
  }

  if (products.length) {
    const hit = products.find(
      (p) =>
        q.includes(p.name.toLowerCase()) ||
        q.includes(p.category.toLowerCase()) ||
        p.name.toLowerCase().split(' ').some((word) => word.length > 3 && q.includes(word))
    );
    if (hit) {
      return `${hit.name} — ₹${hit.price}, ${hit.category}, ages ${hit.ageGroup}. ${hit.description?.slice(0, 100) || ''} WhatsApp to check stock: ${store.whatsapp}`;
    }
  }

  return `Thanks for asking! VJ Fashions has newborn & kids wear in Chirala (${store.hours}). Browse our shop page or WhatsApp us directly: ${store.whatsapp}`;
};
