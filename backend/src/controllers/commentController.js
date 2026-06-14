import Comment from '../models/Comment.js';
import Product from '../models/Product.js';

export const getAllComments = async (_req, res) => {
  const comments = await Comment.find()
    .populate('userId', 'name email')
    .populate('productId', 'name')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json(
    comments.map((c) => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      userName: c.userId?.name || 'Anonymous',
      userEmail: c.userId?.email,
      productId: c.productId?._id,
      productName: c.productId?.name || 'Deleted product'
    }))
  );
};

export const getProductComments = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const comments = await Comment.find({ productId: req.params.productId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  res.json(
    comments.map((c) => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      userName: c.userId?.name || 'Anonymous'
    }))
  );
};

export const addComment = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const comment = await Comment.create({
    userId: req.user.id,
    productId: req.params.productId,
    text: req.body.text
  });

  const populated = await comment.populate('userId', 'name');
  res.status(201).json({
    _id: populated._id,
    text: populated.text,
    createdAt: populated.createdAt,
    userName: populated.userId.name
  });
};

export const deleteComment = async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  res.json({ message: 'Comment deleted' });
};
