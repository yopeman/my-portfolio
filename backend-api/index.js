import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { routes } from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

connectDB();
configureCloudinary();

const server = app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;