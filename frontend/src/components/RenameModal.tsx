import React, { useState } from 'react';

interface Props {
  show: boolean;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onClose: () => void;
}

const RenameModal: React.FC<Props> = ({ show, currentTitle, onSave, onClose }) => {
  const [title, setTitle] = useState(currentTitle);
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div
        className="bg-white rounded-xl p-8 shadow-2xl w-[420px] max-w-full"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Перейменувати</h2>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400">
            Скасувати
          </button>
          <button
            disabled={!title.trim()}
            onClick={() => onSave(title.trim())}
            className={`px-6 py-3 rounded-lg text-white ${
              title.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'
            }`}
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;
