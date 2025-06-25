import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContextMenu from '../components/ContextMenu';
import RenameModal from '../components/RenameModal';
import SlidePreview from '../components/SlidePreview';

interface Card {
  _id: string;
  title: string;
  updatedAt: string;
}

export default function Home() {
  const [list, setList] = useState<Card[]>([]);
  const [pre, setPre] = useState<Record<string, any>>({});
  const [ctx, setCtx] = useState<{
    show: boolean;
    x: number;
    y: number;
    card: Card | null;
  }>({ show: false, x: 0, y: 0, card: null });
  const [renameOpen, setRenameOpen] = useState(false);
  const nav = useNavigate();
  const token = localStorage.getItem('token');

  // отримати список
  useEffect(() => {
    axios
      .get<Card[]>('http://localhost:5000/api/presentations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(r => setList(r.data))
      .catch(() => setList([]));
  }, []);

  /* ── підвантажуємо прев’ю після отримання списку ─────────── */
  useEffect(() => {
    list.forEach(async p => {
      if (pre[p._id]) return; // уже є
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/presentations/${p._id}/slide/0`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setPre(prev => ({ ...prev, [p._id]: data }));
      } catch {
        /* ignore */
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  // створити нову
  const createNew = async () => {
    const res = await axios.post(
      'http://localhost:5000/api/presentations',
      { title: 'Нова презентація', slides: [] },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    nav(`/editor/${res.data.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Мої презентації</h1>

        <button
          onClick={createNew}
          className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + Створити нову
        </button>

       {/* ширша сітка: до 4-х карток у ряд */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {list.map(p => (
            <div
              key={p._id}
              onClick={() => nav(`/editor/${p._id}`)}
              onContextMenu={e => {
                e.preventDefault();
                setCtx({ show: true, x: e.pageX, y: e.pageY, card: p });
              }}
              className="relative cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-2">{p.title}</h2>

              {pre[p._id] ? (
                <SlidePreview slide={pre[p._id]} />
              ) : (
                <div className="w-full aspect-[16/10] bg-gray-200 rounded animate-pulse" />
              )}
              
              <p className="text-sm text-gray-500">
                Оновлено:{' '}
                {new Date(p.updatedAt).toLocaleDateString('uk-UA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-gray-500">Немає збережених презентацій.</p>
          )}
        </div>

        {/* контекстне меню */}
        <ContextMenu
          show={ctx.show}
          x={ctx.x}
          y={ctx.y}
          onClose={() => setCtx({ ...ctx, show: false })}
          onRename={() => setRenameOpen(true)}
          onDelete={async () => {
            if (!ctx.card) return;
            await axios.delete(`http://localhost:5000/api/presentations/${ctx.card._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setList(list.filter(c => c._id !== ctx.card!._id));
          }}
        />

        {/* модалка перейменування */}
        <RenameModal
          show={renameOpen}
          currentTitle={ctx.card?.title || ''}
          onClose={() => setRenameOpen(false)}
          onSave={async newTitle => {
            if (!ctx.card) return;
            await axios.put(
              `http://localhost:5000/api/presentations/${ctx.card._id}`,
              { title: newTitle },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            setList(
              list.map(c => (c._id === ctx.card!._id ? { ...c, title: newTitle } : c)),
            );
            setRenameOpen(false);
          }}
        />
      </div>
    </div>
  );
}
