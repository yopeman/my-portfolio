import mongoose from 'mongoose';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value${Object.keys(err.keyValue || {}).length ? ` for ${Object.keys(err.keyValue).join(', ')}` : ''}`;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  }

  console.error(`[${statusCode}]`, err);

  const body = { error: message };
  if (err.details) {
    body.details = err.details;
  }
  res.status(statusCode).json(body);
}