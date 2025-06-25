import { Router } from 'express';
import formidable from 'formidable';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { parse } from 'pptx2json-ts';

const router = Router();

/*──────────────────── 1. JWT-middleware ────────────────────*/
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

/*──────────────────── 2. constants / helpers ───────────────*/
const CANVAS_W = 1440 - 64;          // 32 px padding L+R
const CANVAS_H = 960  - 64;          // 32 px padding T+B
const SRC_W = 960;                   // Google-Slides після toPx
const SRC_H = 540;

const scaleX = CANVAS_W / SRC_W;     // ≈1.433
const scaleY = CANVAS_H / SRC_H;     // ≈1.777

/* 1 EMU → px | pt(<300) → px | already px */
const toPx = (v: number): number => {
  if (v > 1_000) return Math.round(v / 9_525);   // EMU
  if (v < 300)   return Math.round(v * 1.3333);  // pt
  return Math.round(v);                          // px
};

/*──────────────────── 3.  POST /api/import ─────────────────*/
router.post('/import', async (req, res) => {
  const form = formidable();

  form.parse(req, async (err, _fields, files) => {
    if (err || !files.file) return res.sendStatus(400);

    const f = Array.isArray(files.file) ? files.file[0] : files.file;
    const buffer = await fs.readFile(f.filepath);

    /* 3-а. OOXML → JS */
    const { slides: rawSlides } = await parse(buffer);

    /* 3-b. нормалізуємо кожен слайд */
    const slides = rawSlides.map((sl: any, idx: number) => {
      const elements: any[] = [];

      /* ——  shapes[]  ——————————————————————————————— */
      (sl.shapes ?? []).forEach((sh: any, i: number) => {
        const fr = sh.frame || sh;
        /* text */
        if (sh.type === 'text') {
          elements.push({
            id: `shT${i}`,
            type: 'text',
            text: sh.text,
            x: toPx(fr.x) * scaleX + 32,
            y: toPx(fr.y) * scaleY + 32,
            width:  toPx(fr.cx) * scaleX,
            height: toPx(fr.cy) * scaleY,
            color: sh.color || '#000',
            fontSize: sh.fontSize ?? 24,
            bold: !!sh.bold,
            italic: !!sh.italic,
          });
        }
        /* image */
        if (sh.type === 'pic' || sh.type === 'image') {
          elements.push({
            id: `shI${i}`,
            type: 'image',
            src: sh.data || sh.src,
            x: toPx(fr.x) * scaleX + 32,
            y: toPx(fr.y) * scaleY + 32,
            width:  toPx(fr.cx) * scaleX,
            height: toPx(fr.cy) * scaleY,
          });
        }
      });

      /* ——  content[]  ——————————————————————————————— */
      (sl.content ?? []).forEach((cnt: any, i: number) => {
        const fr = cnt.frame || cnt;
        if (cnt.type === 'text') {
          const strip = (html: string) =>
            html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
          elements.push({
            id: `ctT${i}`,
            type: 'text',
            text: strip(cnt.text ?? cnt.content ?? ''),
            x: toPx(fr.x) * scaleX + 32,
            y: toPx(fr.y) * scaleY + 32,
            width:  toPx(fr.cx) * scaleX,
            height: toPx(fr.cy) * scaleY,
            color: cnt.color || '#000',
            fontSize: cnt.fontSize ?? 24,
            bold: !!cnt.bold,
            italic: !!cnt.italic,
          });
        }
        if (cnt.type === 'pic' || cnt.type === 'image') {
          elements.push({
            id: `ctI${i}`,
            type: 'image',
            src: cnt.data || cnt.src,
            x: toPx(fr.x) * scaleX + 32,
            y: toPx(fr.y) * scaleY + 32,
            width:  toPx(fr.cx) * scaleX,
            height: toPx(fr.cy) * scaleY,
          });
        }
      });

      /* ——  elements[]  ———————————————————————————— */
      (sl.elements ?? []).forEach((el: any, i: number) => {
        if (el.type === 'shape') {
          const strip = (h: string) =>
            h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
          elements.push({
            id: `elT${i}`,
            type: 'text',
            text: strip(el.content ?? ''),
            x: toPx(el.left) * scaleX + 32,
            y: toPx(el.top)  * scaleY + 32,
            width:  toPx(el.width)  * scaleX,
            height: toPx(el.height) * scaleY,
            color: '#000',
            fontSize: 24,
            bold: false,
            italic: false,
          });
        }
        if (el.type === 'image' || el.type === 'pic') {
          elements.push({
            id: `elI${i}`,
            type: 'image',
            src: el.data || el.src,
            x: toPx(el.left) * scaleX + 32,
            y: toPx(el.top)  * scaleY + 32,
            width:  toPx(el.width)  * scaleX,
            height: toPx(el.height) * scaleY,
          });
        }
      });

      /* ——  fallback на старі поля texts[] / images[] —— */
      (sl.texts ?? []).forEach((t: any, i: number) => {
        elements.push({
          id: `txT${i}`,
          type: 'text',
          text: t.text,
          x: toPx(t.frame.x) * scaleX + 32,
          y: toPx(t.frame.y) * scaleY + 32,
          width:  toPx(t.frame.cx) * scaleX,
          height: toPx(t.frame.cy) * scaleY,
          color: t.color || '#000',
          fontSize: t.fontSize ?? 24,
          bold: !!t.bold,
          italic: !!t.italic,
        });
      });

      (sl.images ?? []).forEach((im: any, i: number) => {
        elements.push({
          id: `txI${i}`,
          type: 'image',
          src: im.data || im.src,
          x: toPx(im.frame.x) * scaleX + 32,
          y: toPx(im.frame.y) * scaleY + 32,
          width:  toPx(im.frame.cx) * scaleX,
          height: toPx(im.frame.cy) * scaleY,
        });
      });

      return {
        id: idx,
        backgroundColor:
          sl.fill?.value || sl.background?.fill || '#FFFFFF',
        elements,
      };
    });

    /* 4. відповідаємо фронтенду */
    res.json({
      title: f.originalFilename?.replace(/\.pptx$/i, '') || 'Imported',
      slides,
    });
  });
});

export default router;
