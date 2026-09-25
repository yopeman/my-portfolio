import { connectDB, disconnectDB, isDbReady } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { defaultPermissionsForRole, hashPassword } from '../services/auth.service.js';

async function seedOwner() {
  const { ownerEmail, ownerPassword, ownerName } = env.seed;
  let owner = await User.findOne({ email: ownerEmail }).sort({ createdAt: 1 });
  if (!owner) owner = await User.findOne({ role: 'owner' }).sort({ createdAt: 1 });

  if (owner) {
    owner.deletedAt = null;
    owner.role = 'owner';
    if (!owner.name) owner.name = ownerName;
    await owner.save();
    console.log(`[owner] ensured owner: ${owner.email}`);
    return;
  }

  const permissions = new Map();
  for (const [resource, actions] of Object.entries(defaultPermissionsForRole('owner'))) {
    permissions.set(resource, actions);
  }

  await User.create({
    name: ownerName,
    email: ownerEmail,
    passwordHash: await hashPassword(ownerPassword),
    role: 'owner',
    permissions,
  });
  console.log(`[owner] created owner: ${ownerEmail}`);
}

async function run() {
  await connectDB();
  try {
    if (!isDbReady()) throw new Error('MongoDB is not connected');
    console.log('=== Seeding database owner ===');
    await seedOwner();
    console.log('=== Done ===');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
