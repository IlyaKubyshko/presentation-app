import React, { useState } from 'react';

/* ── новий проп для виклику збереження ───────────────── */
interface MenuBarProps {
  onSave: () => void;
  onImportPptx: () => void;
  onExportPptx: () => void;
  onExportPdf: () => void;
}

/* ── типи пунктів меню ───────────────────────────────── */
interface MenuItem {
  label: string;
  action?: () => void;
  disabled?: boolean;
}
interface Menu {
  title: string;
  items: MenuItem[];
}

const MenuBar: React.FC<MenuBarProps> = ({
  onSave,
  onImportPptx,
  onExportPptx,
  onExportPdf,
}) => {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (title: string) => setOpen(prev => (prev === title ? null : title));

  /* список меню формуємо усередині, щоб мати доступ до onSave */
  const menus: Menu[] = [
    {
      title: 'Файл',
      items: [
        { label: 'Новий проєкт', action: () => window.location.reload() },
        { label: 'Відкрити…', disabled: true },
        { label: 'Зберегти', action: onSave },            /* ← викликає onSave */
        { label: 'Імпорт із PPTX', action: onImportPptx },
        { label: 'Експорт у PPTX', action: onExportPptx },
        { label: 'Експорт у PDF', action: onExportPdf },
      ],
    },
    {
      title: 'Правка',
      items: [
        { label: 'Відмінити', disabled: true },
        { label: 'Повторити', disabled: true },
        { label: 'Вирізати', disabled: true },
        { label: 'Копіювати', disabled: true },
        { label: 'Вставити', disabled: true },
      ],
    },
    {
      title: 'Вставка',
      items: [
        { label: 'Текстове поле', disabled: true },
        { label: 'Зображення', disabled: true },
        { label: 'Фігура', disabled: true },
        { label: 'Лінія', disabled: true },
      ],
    },
    {
      title: 'Формат',
      items: [
        { label: 'Жирний (Ctrl+B)', disabled: true },
        { label: 'Курсив (Ctrl+I)', disabled: true },
        { label: 'Розмір шрифту +', disabled: true },
        { label: 'Розмір шрифту –', disabled: true },
        { label: 'Вирівняти по центру', disabled: true },
      ],
    },
    {
      title: 'Слайд',
      items: [
        { label: 'Новий слайд', disabled: true },
        { label: 'Дублювати слайд', disabled: true },
        { label: 'Видалити слайд', disabled: true },
      ],
    },
    {
      title: 'Обʼєкт',
      items: [
        { label: 'На передній план', disabled: true },
        { label: 'На задній план', disabled: true },
        { label: 'Групувати', disabled: true },
        { label: 'Розгрупувати', disabled: true },
      ],
    },
    {
      title: 'Справка',
      items: [
        { label: 'Документація', disabled: true },
        { label: 'Гарячі клавіші', disabled: true },
        { label: 'Про SlideSmith', disabled: true },
      ],
    },
  ];

  return (
    <div className="relative select-none">
      <div className="flex space-x-8 items-center">
        {menus.map(menu => (
          <div key={menu.title} className="relative">
            {/* кнопка меню у шапці */}
            <button
              onClick={() => toggle(menu.title)}
              className="text-white hover:underline focus:outline-none"
            >
              {menu.title}
            </button>

            {/* випадаючий список */}
            {open === menu.title && (
              <div
                onMouseLeave={() => setOpen(null)}
                className="absolute mt-2 w-56 bg-white shadow-xl rounded-md border z-40"
              >
                {menu.items.map(item => (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => {
                      item.action?.();
                      setOpen(null);
                    }}
                    className={`w-full text-left px-4 py-2 border-b last:border-b-0
                      ${
                        item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-900 hover:bg-blue-50'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
