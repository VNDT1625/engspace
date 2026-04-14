const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    tags: [{ type: String }],
    coverImage: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

blogPostSchema.index({ title: 'text', content: 'text', tags: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);



