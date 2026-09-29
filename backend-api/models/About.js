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
    progress: { type: Number, required: true, min: 1, max: 100, default: 50 },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const EXPERIENCE_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

const educationSchema = new Schema(
  {
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    field: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    cgpa: { type: Number, min: 0, max: 10, default: null },
    description: { type: String },
    link: { type: String },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const experienceSchema = new Schema(
  {
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    type: { type: String, enum: EXPERIENCE_TYPES, default: 'full-time' },
    location: { type: String, trim: true },
    remote: { type: Boolean, default: false },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    description: { type: String },
    highlights: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    link: { type: String },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const aboutSchema = new Schema(
  {
    bio: { type: String },
    headline: { type: String },
    contacts: { type: [contactSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    educations: { type: [educationSchema], default: [] },
    experiences: { type: [experienceSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

aboutSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

aboutSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

aboutSchema.index({ deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export default mongoose.model('About', aboutSchema);
