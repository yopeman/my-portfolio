import mongoose from 'mongoose';

const { Schema } = mongoose;

const fileSchema = new Schema(
  {
    parentEntity: { type: String, enum: ['user', 'about', 'project', 'blog', 'plan'], required: true },
    parentId: { type: Schema.Types.ObjectId, required: true },
    order: { type: Number, default: 0 },
    title: { type: String, trim: true },
    alt: { type: String, trim: true },
    name: { type: String, trim: true },
    path: { type: String },
    storageKey: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

fileSchema.index({ parentEntity: 1, parentId: 1, order: 1 });
fileSchema.index({ deletedAt: 1 });

export default mongoose.model('File', fileSchema);