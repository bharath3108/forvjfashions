import mongoose from 'mongoose';
import { CATEGORIES, AGE_GROUPS } from '../config/constants.js';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: CATEGORIES },
  ageGroup: { type: String, required: true, enum: AGE_GROUPS },
  sizes: [{ type: String }],
  imgIds: [{ type: String, required: true }],
  isAvailable: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
