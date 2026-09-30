import mongoose from 'mongoose';

const { Schema } = mongoose;

const reactionSchema = new Schema(
  {
    parentEntity: {
      type: String,
      enum: ['about', 'project', 'blog', 'plan', 'system', 'feedback'],
      required: true,
    },
    parentId: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'dislike', 'love'], required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reactionSchema.index(
  { parentEntity: 1, parentId: 1, user: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

export default mongoose.model('Reaction', reactionSchema);