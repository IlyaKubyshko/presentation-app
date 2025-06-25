import React, { useRef, useEffect, useState } from 'react';

const CANVAS_W = 1376;
const CANVAS_H = 896;
const PAD = 32;

const SlidePreview = ({ slide }: { slide: any }) => {
  /* масштабуємо в залежності від реальної ширини контейнера */
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.15);         // початково — ~20 %

  useEffect(() => {
    const recalc = () => {
      if (!box.current) return;
      setScale(box.current.clientWidth / CANVAS_W);
    };
    recalc();                       // одразу після маунта
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  return (
    <div
      ref={box}
      style={{
        width: '100%',
        height: CANVAS_H * scale,
        background: slide.background || '#cbd5e1',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
      }}
    >
      {slide.elements.map((el: any) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: (el.x - PAD) * scale,
          top: (el.y - PAD) * scale,
          width: el.width * scale,
          height: el.height * scale,
        };

        if (el.type === 'text')
          return (
            <div
              key={el.id}
              style={{
                ...style,
                fontSize: el.fontSize * scale,
                color: el.color,
                fontWeight: el.bold ? 'bold' : 'normal',
                fontStyle: el.italic ? 'italic' : 'normal',
                whiteSpace: 'pre-wrap',
                textAlign: 'center',
                overflow: 'hidden',
              }}
            >
              {el.text}
            </div>
          );

        if (el.type === 'image')
          return (
            <img
              key={el.id}
              src={el.src}
              alt=""
              style={{ ...style, objectFit: 'cover' }}
            />
          );

        return null;
      })}
    </div>
  );
};

export default SlidePreview;
