import mongoose from 'mongoose';

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    parentEntity: { type: String, enum: ['about', 'project', 'blog', 'plan'], required: true },
    parentId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['feedback', 'comment', 'reply'], default: 'feedback' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

feedbackSchema.index({ parentEntity: 1, parentId: 1, createdAt: 1 });
feedbackSchema.index({ deletedAt: 1 });

export default mongoose.model('Feedback', feedbackSchema);