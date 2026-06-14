import { Router } from 'express';

const router = Router();

const DEFAULT_ADDRESS =
  'Ground First And Second Floor, Door No 14, RR Road, Muntha vari Centre, Chirala, Andhra Pradesh 523155';
const DEFAULT_MAP_EMBED =
  'https://www.google.com/maps?q=Ground+First+And+Second+Floor,+Door+No+14,+RR+Road,+Muntha+vari+Centre,+Chirala,+Andhra+Pradesh+523155&output=embed';

router.get('/', (_req, res) => {
  res.json({
    name: 'VJ Fashions',
    tagline: 'Quality newborn & kids wear in Chirala',
    address: process.env.STORE_ADDRESS || DEFAULT_ADDRESS,
    phone: process.env.STORE_PHONE || '+917799540006',
    whatsapp: process.env.WHATSAPP_NUMBER || '917799540006',
    hours: process.env.STORE_HOURS || '10:00 AM – 9:00 PM (Daily)',
    mapEmbedUrl: process.env.STORE_MAP_EMBED_URL || DEFAULT_MAP_EMBED
  });
});

export default router;
