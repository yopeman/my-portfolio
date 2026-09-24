import mongoose from 'mongoose';

const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    name: { type: String, trim: true },
    title: { type: String, trim: true },
    link: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const skillSchema = new Schema(
  {
    category: { type: String, trim: true },
    name: { type: String, trim: true },
    progress: { type: Number, min: 1, max: 100 },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const aboutSchema = new Schema(
  {
    bio: { type: String },
    headline: { type: String },
    contacts: { type: [contactSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('About', aboutSchema);