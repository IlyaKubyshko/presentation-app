
import React from 'react';

interface SidebarProps {
  slides: { id: number }[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ slides, currentSlideIndex, onSelectSlide, onAddSlide }) => {
  return (
    <div className="w-64 bg-white border-r p-4 space-y-4">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={
            'p-4 text-center border-2 rounded-lg cursor-pointer text-lg ' +
            (index === currentSlideIndex ? 'bg-yellow-200 border-yellow-600' : 'hover:bg-gray-200')
          }
          style={{ minHeight: 64 }}
          onClick={() => onSelectSlide(index)}
        >
          Слайд {index + 1}
        </div>
      ))}
      <button
        onClick={onAddSlide}
        className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg text-lg"
      >
        + Додати слайд
      </button>
    </div>
  );
};

export default Sidebar;
