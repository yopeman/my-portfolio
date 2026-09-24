import mongoose from 'mongoose';

const { Schema } = mongoose;

const featureSchema = new Schema(
  {
    name: { type: String, trim: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const stackSchema = new Schema(
  {
    name: { type: String, trim: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const linkSchema = new Schema(
  {
    type: { type: String, trim: true },
    link: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String },
    problem: { type: String },
    solution: { type: String },
    summary: { type: String },
    order: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    type: { type: String, enum: ['product', 'case study', 'tutorial'], default: 'product' },
    features: { type: [featureSchema], default: [] },
    stacks: { type: [stackSchema], default: [] },
    links: { type: [linkSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

projectSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
projectSchema.index({ order: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);