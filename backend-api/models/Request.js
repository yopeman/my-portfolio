import mongoose from 'mongoose';

const { Schema } = mongoose;

const requestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    status: {
      type: String,
      enum: ['pending', 'replied', 'assigned', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    timeline: { type: [String], default: [] },
    requirements: { type: String },
    minBudget: { type: Number, min: 0 },
    maxBudget: { type: Number, min: 0 },
    readAt: { type: Date, default: null },
    repliedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ deletedAt: 1 });

export default mongoose.model('Request', requestSchema);