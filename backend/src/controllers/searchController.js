import Product from '../models/Product.js';

const buildFilterMatch = (category, ageGroup) => {
  const match = {};
  if (category) match.category = category;
  if (ageGroup) match.ageGroup = ageGroup;
  return Object.keys(match).length ? match : null;
};

export const searchProducts = async (req, res) => {
  const { q, category, ageGroup } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ message: 'Search query must be at least 2 characters' });
  }

  const filterMatch = buildFilterMatch(category, ageGroup);

  try {
    const pipeline = [
      {
        $search: {
          index: 'product_search',
          text: {
            query: q.trim(),
            path: ['name', 'description'],
            fuzzy: { maxEdits: 2 }
          }
        }
      }
    ];
    if (filterMatch) pipeline.push({ $match: filterMatch });
    pipeline.push({ $limit: 50 });

    const results = await Product.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    if (err.message?.includes('$search')) {
      const filter = {
        $or: [
          { name: { $regex: q.trim(), $options: 'i' } },
          { description: { $regex: q.trim(), $options: 'i' } }
        ]
      };
      if (category) filter.category = category;
      if (ageGroup) filter.ageGroup = ageGroup;

      const fallback = await Product.find(filter).limit(50).lean();
      return res.json(fallback);
    }
    throw err;
  }
};
