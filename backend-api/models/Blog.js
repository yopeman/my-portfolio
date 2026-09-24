import mongoose from 'mongoose';

const { Schema } = mongoose;

const linkSchema = new Schema(
  {
    type: { type: String, trim: true },
    link: { type: String },
  },
  { _id: false }
);

const blogSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, lowercase: true },
    type: { type: String, enum: ['event', 'article', 'blog'], default: 'blog' },
    title: { type: String, required: true, trim: true },
    content: { type: String },
    excerpt: { type: String },
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    readingTime: { type: Number, default: 0 },
    links: { type: [linkSchema], default: [] },
    publishedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
blogSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model('Blog', blogSchema);