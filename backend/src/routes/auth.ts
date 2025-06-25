import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// ─── POST /api/register ──────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { nickname, password } = req.body;
  if (!nickname || !password)
    return res.status(400).json({ message: 'Порожні поля' });

  const exists = await User.findOne({ nickname });
  if (exists) return res.status(409).json({ message: 'Нік уже зайнято' });

  const hash = await bcrypt.hash(password, 10);
  await User.create({ nickname, passwordHash: hash });

  res.sendStatus(201);
});

// ─── POST /api/login ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { nickname, password } = req.body;
  const user = await User.findOne({ nickname });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));

  if (!ok)
    return res.status(401).json({ message: 'Невірний нікнейм або пароль' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '2h',
  });

  res.json({ token, nickname });
});

export default router;
