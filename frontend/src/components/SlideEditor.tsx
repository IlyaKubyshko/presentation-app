import React, { useEffect, useRef, useState } from 'react';

/* ─────────── типи ─────────── */
export interface TextEl {
  id: number;
  type: 'text';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
}

export interface ImageEl {
  id: number;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SlideElement = TextEl | ImageEl;

/* ─────────── константи ─────────── */
const SLIDE_W = 1440;
const SLIDE_H = 960;
const MIN = 40;
const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));

interface Props {
  elements: SlideElement[];
  onUpdateElements: (els: SlideElement[]) => void;
  backgroundColor: string;
  selectedElementId: number | null;
  setSelectedElementId: (id: number | null) => void;
}

/* ───────────────────────────────── component ───────────────────────────────── */
const SlideEditor: React.FC<Props> = ({
  elements,
  onUpdateElements,
  backgroundColor,
  selectedElementId,
  setSelectedElementId,
}) => {
  const [drag, setDrag] = useState<
    | {
        id: number;
        mode: 'move' | 'resize';
        offX: number;
        offY: number;
        w: number;
        h: number;
      }
    | null
  >(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* утиліта-патч */
  const patch = (id: number, p: Partial<SlideElement>) =>
    onUpdateElements(elements.map(el => (el.id === id ? { ...el, ...p } : el)));

  /* ───────── drag / resize ───────── */
  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (!drag) return;
      onUpdateElements(
        elements.map(el => {
          if (el.id !== drag.id) return el;

          if (drag.mode === 'move') {
            const w = el.width ?? 200;
            const h = (el as any).height ?? 60;
            return {
              ...el,
              x: clamp(e.clientX - drag.offX, 0, SLIDE_W - w),
              y: clamp(e.clientY - drag.offY, 0, SLIDE_H - h),
            };
          }

          /* resize  (для image і text) */
          let newW = drag.w + (e.clientX - drag.offX);
          let newH = drag.h + (e.clientY - drag.offY);

          /* тримаємо пропорцію */
          const r = drag.w / drag.h;
          if (Math.abs(newW - drag.w) > Math.abs(newH - drag.h)) newH = newW / r;
          else newW = newH * r;

          newW = clamp(newW, MIN, SLIDE_W - el.x);
          newH = clamp(newH, MIN, SLIDE_H - el.y);

          return { ...el, width: newW, height: newH };
        }),
      );
    };
    const mu = () => setDrag(null);

    if (drag) {
      window.addEventListener('mousemove', mm);
      window.addEventListener('mouseup', mu);
    }
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
  }, [drag, elements, onUpdateElements]);

  /* Delete = remove */
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId !== null) {
        onUpdateElements(elements.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, [elements, onUpdateElements, selectedElementId, setSelectedElementId]);

  /* ─────────── render ─────────── */
  return (
    <div
      className="relative shadow-2xl rounded-lg border"
      style={{ width: SLIDE_W, height: SLIDE_H, backgroundColor, userSelect: drag ? 'none' : 'auto' }}
      onMouseDown={() => setSelectedElementId(null)}
    >
      {elements.map(el =>
        el.type === 'text' ? (
          /* ────────── TEXT ────────── */
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              color: el.color,
              fontSize: el.fontSize,
              fontWeight: el.bold ? 700 : 400,
              fontStyle: el.italic ? 'italic' : 'normal',
              padding: 6,
              border: selectedElementId === el.id ? '2px solid #2196f3' : 'none',
              borderRadius: 6,
              cursor: drag?.id === el.id ? 'grabbing' : 'move',
              background: 'transparent',
              overflow: 'hidden',
            }}
            onMouseDown={e => {
              e.stopPropagation();
              setSelectedElementId(el.id);

              /* Shift-click — лише вибір, move не стартує */
              if (e.shiftKey) return;

              setDrag({
                id: el.id,
                mode: 'move',
                offX: e.clientX - el.x,
                offY: e.clientY - el.y,
                w: el.width,
                h: el.height,
              });
            }}
            onDoubleClick={() => {
              setSelectedElementId(el.id);
              setTimeout(() => textareaRef.current?.focus(), 0);
            }}
          >
            {selectedElementId === el.id ? (
              <textarea
                ref={textareaRef}
                value={el.text}
                onChange={ev => patch(el.id, { text: ev.target.value })}
                className="resize-none bg-transparent outline-none w-full h-full"
                style={{
                  fontSize: el.fontSize,
                  fontWeight: el.bold ? 700 : 400,
                  fontStyle: el.italic ? 'italic' : 'normal',
                  color: el.color,
                }}
              />
            ) : (
              el.text
            )}

            {/* handle для text */}
            {selectedElementId === el.id && (
              <div
                onMouseDown={e => {
                  if (!e.shiftKey) return; // resize лише з Shift
                  e.stopPropagation();
                  setDrag({
                    id: el.id,
                    mode: 'resize',
                    offX: e.clientX,
                    offY: e.clientY,
                    w: el.width,
                    h: el.height,
                  });
                }}
                className="absolute w-8 h-8 bg-blue-500/80 border-2 border-white rounded-full cursor-nwse-resize"
                style={{ right: -10, bottom: -10 }}
                title="Shift + Drag — змінити розмір"
              />
            )}
          </div>
        ) : (
          /* ────────── IMAGE ────────── */
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              border: selectedElementId === el.id ? '2px solid #2196f3' : 'none',
              borderRadius: 6,
              overflow: 'hidden',
              cursor: drag?.id === el.id ? 'grabbing' : 'move',
            }}
            onMouseDown={e => {
              e.stopPropagation();
              setSelectedElementId(el.id);

              if (e.shiftKey) return; // Shift блокує move

              setDrag({
                id: el.id,
                mode: 'move',
                offX: e.clientX - el.x,
                offY: e.clientY - el.y,
                w: el.width,
                h: el.height,
              });
            }}
          >
            <img
              src={el.src}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            {selectedElementId === el.id && (
              <div
                onMouseDown={e => {
                  if (!e.shiftKey) return;
                  e.stopPropagation();
                  setDrag({
                    id: el.id,
                    mode: 'resize',
                    offX: e.clientX,
                    offY: e.clientY,
                    w: el.width,
                    h: el.height,
                  });
                }}
                className="absolute w-8 h-8 bg-blue-500/80 border-2 border-white rounded-full cursor-nwse-resize"
                style={{ right: -10, bottom: -10 }}
                title="Shift + Drag — змінити розмір"
              />
            )}
          </div>
        ),
      )}
    </div>
  );
};

export default SlideEditor;
