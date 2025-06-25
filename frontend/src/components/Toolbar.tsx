import React from 'react';

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onChangeColor: (color: string) => void;
  onChangeFontSize: (size: number) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onChangeBackground: (color: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddText,
  onAddImage,
  onChangeColor,
  onChangeFontSize,
  onToggleBold,
  onToggleItalic,
  onChangeBackground,
}) => {
  const fileInput = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex space-x-4 p-4 border-b bg-gray-100" style={{ minHeight: 64 }}>
      <button className="px-6 py-3 text-lg bg-blue-600 text-white rounded" onClick={onAddText}>
        Додати текст
      </button>

      {/* Кнопка «Додати зображення» */}
      <button
        className="px-6 py-3 text-lg bg-green-600 text-white rounded"
        onClick={() => fileInput.current?.click()}
      >
        Додати зображення
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onAddImage(f);
          e.target.value = '';
        }}
      />

      {/* решта існуючих елементів */}
      <input type="color" className="w-12 h-12 border" onChange={e => onChangeColor(e.target.value)} />
      <input
        type="number"
        min="8"
        max="72"
        className="border px-4 py-2 w-32 text-lg"
        placeholder="Розмір"
        onChange={e => onChangeFontSize(Number(e.target.value))}
      />
      <button className="px-4 py-2 text-lg border font-bold" onClick={onToggleBold}>
        B
      </button>
      <button className="px-4 py-2 text-lg border italic" onClick={onToggleItalic}>
        I
      </button>
      <label className="ml-8 text-base">Фон слайду:</label>
      <input
        type="color"
        className="w-12 h-12 border"
        onChange={e => onChangeBackground(e.target.value)}
      />
    </div>
  );
};

export default Toolbar;
