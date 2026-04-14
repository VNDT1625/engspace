const BlogPost = require('../models/BlogPost');

exports.list = async (req, res) => {
  const { q, status = 'published' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$text = { $search: q };
  }
  const posts = await BlogPost.find(filter)
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(Number(req.query.limit) || 50);
  res.json(posts);
};

exports.getBySlug = async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.get = async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.create = async (req, res) => {
  const payload = { ...req.body };
  if (!payload.slug) payload.slug = payload.title?.toLowerCase().replace(/\s+/g, '-') || Date.now().toString();
  payload.author = req.user?._id;
  if (payload.status === 'published' && !payload.publishedAt) {
    payload.publishedAt = new Date();
  }
  const post = await BlogPost.create(payload);
  res.status(201).json(post);
};

exports.update = async (req, res) => {
  const payload = { ...req.body };
  if (payload.status === 'published' && !payload.publishedAt) {
    payload.publishedAt = new Date();
  }
  const post = await BlogPost.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.remove = async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ message: 'Deleted' });
};



