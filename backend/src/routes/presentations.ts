import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Presentation from '../models/Presentation';

const router = Router();

// ── JWT-перевірка ─────────────────────
router.use((req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    (req as any).userId = payload.id;
    next();
  } catch {
    res.sendStatus(401);
  }
});

// ── список презентацій (тільки id/назва/дата) ──
router.get('/presentations', async (req, res) => {
  const list = await Presentation.find({ userId: (req as any).userId })
    .select('_id title updatedAt')
    .sort({ updatedAt: -1 });
  res.json(list);
});

// ── створити нову ─────────────────────
router.post('/presentations', async (req, res) => {
  const { title, slides } = req.body;
  const pres = await Presentation.create({
    userId: (req as any).userId,
    title,
    slides,
  });
  res.status(201).json({ id: pres._id });
});

// ── отримати одну ─────────────────────
router.get('/presentations/:id', async (req, res) => {
  const pres = await Presentation.findOne({
    _id: req.params.id,
    userId: (req as any).userId,
  });
  pres ? res.json(pres) : res.sendStatus(404);
});

// ── оновити ───────────────────────────
router.put('/presentations/:id', async (req, res) => {
  const { title, slides } = req.body;
  await Presentation.updateOne(
    { _id: req.params.id, userId: (req as any).userId },
    { $set: { title, slides, updatedAt: new Date() } },
  );
  res.sendStatus(204);
});

// ── видалити ─────────────────────────
router.delete('/presentations/:id', async (req, res) => {
  await Presentation.deleteOne({
    _id: req.params.id,
    userId: (req as any).userId,
  });
  res.sendStatus(204);
});

/* GET → перший слайд (для прев’ю) */
router.get('/presentations/:id/slide/0', async (req, res) => {
  const p = await Presentation.findOne(
    { _id: req.params.id, userId: (req as any).userId },
    { slides: { $slice: 1 } },        // віддаємо тільки slides[0]
  );
  if (!p) return res.sendStatus(404);
  res.json(p.slides[0]);              // ⟶ { background, elements, … }
});


export default router;
