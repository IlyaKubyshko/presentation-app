import React from 'react';

interface Props {
  show: boolean;
  fileName: string;
  setFileName: (n: string) => void;
  onSave: () => void;
  onClose: () => void;
  format: 'pdf' | 'pptx';
}

const ExportModal: React.FC<Props> = ({ show, fileName, setFileName, onSave, onClose, format }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl p-8 shadow-2xl w-[480px] max-w-full"
        onClick={e => e.stopPropagation()}
      >
         <h2 className="text-2xl font-semibold mb-6 text-center">
           Експорт у {format.toUpperCase()}
         </h2>

        <label className="block mb-4 text-lg font-medium">Назва файлу:</label>
        <input
          type="text"
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          className="w-full border rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="presentation"
        />

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-lg"
          >
            Скасувати
          </button>
          <button
            disabled={!fileName.trim()}
            onClick={onSave}
            className={`px-6 py-3 rounded-lg text-lg text-white ${
              fileName.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'
            }`}
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
