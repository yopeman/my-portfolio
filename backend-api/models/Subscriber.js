import mongoose from 'mongoose';

const { Schema } = mongoose;

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    unsubscribedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

subscriberSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export default mongoose.model('Subscriber', subscriberSchema);