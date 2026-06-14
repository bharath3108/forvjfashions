import Product from '../models/Product.js';
import { CATEGORIES, AGE_GROUPS } from '../config/constants.js';

const storeBlock = () => {
  const whatsapp = process.env.WHATSAPP_NUMBER || '917799540006';
  return `
Store: VJ Fashions — newborn & kids wear in Chirala, Andhra Pradesh
Address: ${process.env.STORE_ADDRESS || 'Chirala, Andhra Pradesh'}
Phone: ${process.env.STORE_PHONE || '+917799540006'}
Hours: ${process.env.STORE_HOURS || '10:00 AM – 9:00 PM (Daily)'}
WhatsApp: ${whatsapp}
Categories: ${CATEGORIES.join(', ')}
Age groups: ${AGE_GROUPS.join(', ')}
`.trim();
};

export const buildChatSystemPrompt = async () => {
  const products = await Product.find({ isAvailable: true })
    .select('name price category ageGroup description')
    .sort({ createdAt: -1 })
    .limit(40)
    .lean();

  const catalogLines = products.length
    ? products.map(
        (p) =>
          `- ${p.name} | ₹${p.price} | ${p.category} | ages ${p.ageGroup} | ${p.description?.slice(0, 120) || ''}`
      )
    : ['- No products listed yet. Ask customers to check back soon or visit the store.'];

  return `You are the friendly AI assistant for VJ Fashions, a local kids & newborn clothing store in Chirala, India.

RULES:
- This is a digital catalog only — there is NO online checkout or cart.
- For buying, stock checks, sizes, or pricing confirmation, always suggest WhatsApp: https://wa.me/${(process.env.WHATSAPP_NUMBER || '917799540006').replace(/\D/g, '')}
- Answer briefly (2–4 sentences unless listing products). Be warm and helpful.
- Only recommend products from the catalog below. If unsure, say so and offer WhatsApp.
- Do not invent products, prices, or policies.
- You can help with store location, hours, categories, age groups, and product suggestions.

${storeBlock()}

CURRENT CATALOG (${products.length} items):
${catalogLines.join('\n')}`;
};
