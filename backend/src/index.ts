import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import presRouter from './routes/presentations';
import pptxRouter from './routes/pptx';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', authRouter);
app.use('/api', presRouter);
app.use('/api', pptxRouter);

// ─── MongoDB ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✔  MongoDB connected');
    app.listen(PORT, () => console.log(`✔  API listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connect error:', err);
    process.exit(1);
  });
