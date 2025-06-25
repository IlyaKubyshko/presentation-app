import React, { useEffect } from 'react';

interface Props {
  show: boolean;
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<Props> = ({ show, x, y, onRename, onDelete, onClose }) => {
  // закриваємо при кліку «повз»
  useEffect(() => {
    if (!show) return;
    const h = () => onClose();
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [show]);

  if (!show) return null;

  return (
    <ul
      style={{ top: y, left: x }}
      className="fixed z-50 w-52 bg-white rounded-lg shadow-lg border divide-y divide-gray-200 select-none"
      onContextMenu={e => e.preventDefault()}
    >
      <li
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        onClick={() => {
          onRename();
          onClose();
        }}
      >
        Перейменувати
      </li>
      <li
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        Видалити
      </li>
    </ul>
  );
};

export default ContextMenu;
