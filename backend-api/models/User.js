import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      trim: true,
      set: (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    additionalContact: { type: String, trim: true },
    bio: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'user'], default: 'user' },
    permissions: {
      type: Map,
      of: { type: [String], enum: ['READ', 'CREATE', 'UPDATE', 'DELETE'], default: [] },
      default: {},
    },
    source: { type: String, trim: true, default: 'credentials' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null, phone: { $type: 'string' } } }
);

export default mongoose.model('User', userSchema);