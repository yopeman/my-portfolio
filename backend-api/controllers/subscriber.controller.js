import { Subscriber } from '../models/index.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination, pageMeta } from '../utils/pagination.js';
import { sendMail } from '../services/email.service.js';
import { env } from '../config/env.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

// Single source of truth for persisting a subscription. Existing rows are revived
// (clearing unsubscribedAt/deletedAt) rather than duplicated, and `created` tells
// the caller whether this is a genuinely new signup worth emailing about.
async function upsertSubscriber(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) throw ApiError.badRequest('A valid email is required');

  const existing = await Subscriber.findOne({ email: normalized });
  if (existing) {
    if (!existing.deletedAt && !existing.unsubscribedAt) {
      return { subscriber: existing, created: false };
    }
    existing.deletedAt = null;
    existing.unsubscribedAt = null;
    await existing.save();
    return { subscriber: existing, created: false };
  }

  try {
    const subscriber = await Subscriber.create({ email: normalized });
    return { subscriber, created: true };
  } catch (error) {
    // Two concurrent signups for the same address: the unique partial index
    // rejects the loser, so fall back to reading the row the winner created.
    if (isDuplicateKeyError(error)) {
      const winner = await Subscriber.findOne({ email: normalized });
      if (winner) return { subscriber: winner, created: false };
    }
    throw error;
  }
}

async function notifyNewSubscriber(email) {
  const receiver = env.receiverEmail;

  await sendMail({
    from: env.smtp.user,
    to: receiver,
    subject: `Portfolio Subscription: New Subscriber`,
    text: `A new user has subscribed to your newsletter.\n\nEmail: ${email}`,
    html:
      `<h3>New Newsletter Subscription</h3>` +
      `<p>A new user has subscribed to your newsletter.</p>` +
      `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>`,
  });

  try {
    await sendMail({
      from: env.smtp.user,
      to: email,
      subject: `Thank you for subscribing!`,
      text:
        `Hello,\n\nThank you for subscribing to Yohanes Debebe's newsletter! You will receive updates about new projects and insights.\n\nBest regards,\nYohanes Debebe`,
      html:
        `<h3>Thank you for subscribing!</h3>` +
        `<p>Hello,</p>` +
        `<p>Thank you for subscribing to Yohanes Debebe's newsletter! You will receive updates about new projects and insights.</p>` +
        `<p>Best regards,<br>Yohanes Debebe</p>`,
    });
  } catch (confError) {
    console.warn('Could not send subscriber confirmation email:', confError);
  }
}

export const subscribe = asyncHandler(async (req, res) => {
  const { subscriber, created } = await upsertSubscriber(req.body.email);
  return res.status(created ? 201 : 200).json({ subscriber, created });
});

// Used by the public /api/subscribe endpoint: persists the record first, then
// sends mail. Mail failures never fail the subscription, because the row is
// already committed and the user should not be asked to retry.
export const subscribeAndNotify = asyncHandler(async (req, res) => {
  const { subscriber, created } = await upsertSubscriber(req.body.email);

  if (created) {
    try {
      await notifyNewSubscriber(subscriber.email);
    } catch (error) {
      console.error('Subscription email error:', error);
    }
  }

  return res.status(created ? 201 : 200).json({
    subscriber,
    created,
    success: true,
    message: created ? 'Subscribed successfully.' : 'You are already subscribed.',
  });
});

export const listSubscribers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { deletedAt: null };
  const [items, total] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Subscriber.countDocuments(filter),
  ]);
  return res.json({ items, meta: pageMeta(page, limit, total) });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
  let subscriber = null;

  if (req.params.id && req.params.id !== ':id' && mongoose.isValidObjectId(req.params.id)) {
    subscriber = await Subscriber.findOne({ _id: req.params.id, deletedAt: null });
  }
  if (!subscriber && normalizedEmail) {
    subscriber = await Subscriber.findOne({ email: normalizedEmail, deletedAt: null });
  }
  if (!subscriber) throw ApiError.notFound('Subscriber not found');
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();
  return res.json({ subscriber });
});

export const removeSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findOne({ _id: req.params.id, deletedAt: null });
  if (!subscriber) throw ApiError.notFound('Subscriber not found');
  await Subscriber.findByIdAndUpdate(subscriber._id, { deletedAt: new Date() });
  return res.json({ success: true });
});