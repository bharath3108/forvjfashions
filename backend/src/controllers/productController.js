import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { invalidateCatalogCache } from '../config/redis.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

export const getProducts = async (req, res) => {
  const { category, ageGroup, available } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (ageGroup) filter.ageGroup = ageGroup;
  if (available === 'true') filter.isAvailable = true;

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
};

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  await invalidateCatalogCache();
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  await invalidateCatalogCache();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  await invalidateCatalogCache();
  res.json({ message: 'Product deleted' });
};

export const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  if (isCloudinaryConfigured()) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'vj-fashions', format: 'webp' },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
      );
      stream.end(req.file.buffer);
    });
    return res.json({ imgId: result.public_id });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({
      message: 'Image upload requires Cloudinary. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    });
  }

  ensureUploadsDir();
  const ext = path.extname(req.file.originalname) || '.jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, safeName), req.file.buffer);
  logger.info(`Image saved locally: ${safeName}`);
  res.json({ imgId: `local/${safeName}` });
};
