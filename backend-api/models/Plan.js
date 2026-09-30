import mongoose from 'mongoose';

const { Schema } = mongoose;

const checklistSchema = new Schema(
  {
    title: { type: String, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in progress', 'completed', 'cancelled', 'failed'],
      default: 'pending',
    },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const planSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, lowercase: true },
    // Minimum role required to view the plan: owner > admin > member > user > guest
    visibility: {
      type: String,
      enum: ['owner', 'admin', 'member', 'user', 'guest'],
      default: 'guest',
    },
    period: {
      type: String,
      enum: ['year', 'half', 'quarter', 'month', 'week', 'day'],
      default: 'year',
    },
    year: { type: Number },
    periodNumber: { type: Number },
    parentPlan: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    goal: { type: String },
    target: { type: String },
    checklists: { type: [checklistSchema], default: [] },
    startDate: { type: Date },
    endDate: { type: Date },
    assignedTo: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

planSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

planSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

planSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
planSchema.index({ parentPlan: 1, deletedAt: 1 });
planSchema.index({ period: 1, year: 1, periodNumber: 1 });

export default mongoose.model('Plan', planSchema);