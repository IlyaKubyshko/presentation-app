import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Toolbar from './components/Toolbar';
import SlideEditor, { SlideElement } from './components/SlideEditor';
import Sidebar from './components/Sidebar';
import ExportModal from './components/ExportModal';
import MenuBar from './components/MenuBar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';

/* ───────────── типи ───────────── */
interface Slide {
  id: number;
  elements: SlideElement[];
  backgroundColor: string;
}

let elementIdCounter = 1;

/* ───────────── компонент ───────────── */
const App: React.FC = () => {
  /* state */
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, elements: [], backgroundColor: '#ffffff' },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'pptx' | null>(null);
  const [fileName, setFileName] = useState('');
  const { id } = useParams();
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ─────── завантажити зі сховища ─────── */
  useEffect(() => {
    if (!id) return;

    const fetchPres = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/presentations/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setFileName(data.title || 'Без назви');
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        } else {
          setSlides([{ id: 1, elements: [], backgroundColor: '#ffffff' }]);
        }
        setCurrentSlideIndex(0);
        setSelectedElementId(null);
      } catch (e) {
        console.error('Не вдалося отримати презентацію', e);
        alert('Помилка читання презентації');
      }
    };

    fetchPres();
  }, [id, token]);

  const currentSlide =
    slides.length > currentSlideIndex ? slides[currentSlideIndex] : null;

  /* ───────── helpers ───────── */
  const updateElements = (elements: SlideElement[]) => {
    if (!currentSlide) return;
    setSlides(prev => {
      const updated = [...prev];
      updated[currentSlideIndex] = { ...updated[currentSlideIndex], elements };
      return updated;
    });
  };

  /* ───────── add elements ───────── */
  const addTextElement = () => {
    if (!currentSlide) return;
    const newEl: SlideElement = {
      id: elementIdCounter++,
      type: 'text',
      text: 'Новий текст',
      x: 100,
      y: 100,
      width: 300,
      height: 120,
      color: '#000000',
      fontSize: 28,
      bold: false,
      italic: false,
    };
    updateElements([...currentSlide.elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const addImageElement = (file: File) => {
    if (!currentSlide) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const maxW = 400;
        const w = img.width > maxW ? maxW : img.width;
        const h = (img.height / img.width) * w;

        const newEl: SlideElement = {
          id: elementIdCounter++,
          type: 'image',
          src: ev.target?.result as string,
          x: 100,
          y: 100,
          width: w,
          height: h,
        };
        updateElements([...currentSlide.elements, newEl]);
        setSelectedElementId(newEl.id);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  /* ───────── save ───────── */
  const savePresentation = async () => {
    try {
      const titleToSave = fileName.trim() || 'Без назви';

      if (id) {
        await axios.put(
          `http://localhost:5000/api/presentations/${id}`,
          { title: titleToSave, slides },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        alert('Збережено!');
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/presentations',
          { title: titleToSave, slides },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        alert('Створено та збережено!');
        nav(`/editor/${res.data.id}`);
      }
    } catch (e) {
      console.error(e);
      alert('Помилка збереження');
    }
  };

  const updateSelectedElement = (patch: Partial<SlideElement>) => {
    if (selectedElementId === null || !currentSlide) return;
    updateElements(
      currentSlide.elements.map(el =>
        el.id === selectedElementId ? ({ ...el, ...patch } as SlideElement) : el,
      ),
    );
  };

  /* ───────── slide ops ───────── */
  const addSlide = () => {
    setSlides(prev => [
      ...prev,
      { id: prev.length + 1, elements: [], backgroundColor: '#ffffff' },
    ]);
    setCurrentSlideIndex(prev => prev + 1);
    setSelectedElementId(null);
  };

  const changeBackground = (color: string) =>
    setSlides(prev => {
      const updated = [...prev];
      updated[currentSlideIndex] = {
        ...updated[currentSlideIndex],
        backgroundColor: color,
      };
      return updated;
    });

  /* ───────── export PDF ───────── */
  const exportToPDF = async () => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1440, 960] });

    for (let i = 0; i < slides.length; i++) {
      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.left = '-20000px';
      temp.style.width = '1440px';
      temp.style.height = '960px';
      temp.style.background = slides[i].backgroundColor;
      document.body.appendChild(temp);

      slides[i].elements.forEach(el => {
        if (el.type === 'text') {
          const d = document.createElement('div');
          d.textContent = el.text;
          Object.assign(d.style, {
            position: 'absolute',
            left: `${el.x}px`,
            top: `${el.y}px`,
            width: `${el.width}px`,
            height: `${el.height}px`,
            fontSize: `${el.fontSize}px`,
            color: el.color,
            fontWeight: el.bold ? '700' : '400',
            fontStyle: el.italic ? 'italic' : 'normal',
            padding: '6px',
          });
          temp.appendChild(d);
        } else {
          const img = new Image();
          img.src = el.src;
          Object.assign(img.style, {
            position: 'absolute',
            left: `${el.x}px`,
            top: `${el.y}px`,
            width: `${el.width}px`,
            height: `${el.height}px`,
            objectFit: 'contain',
          });
          temp.appendChild(img);
        }
      });

      const canvas = await html2canvas(temp);
      const data = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      pdf.addImage(data, 'PNG', 0, 0, 1440, 960);
      temp.remove();
    }
    pdf.save((fileName.trim() || 'presentation') + '.pdf');
  };

  /* ───────── export PPTX (оновлена) ───────── */
  const exportToPPTX = async () => {
    const { default: PptxGen } = await import('pptxgenjs');
    const pptx = new PptxGen();

    const CANVAS_W = 1440 - 64;          // 1376
const CANVAS_H = 960  - 64;          // 896
const SRC_W = 960;                   // цільова ширина слайда
const SRC_H = 540;                   // цільова висота слайда
const PAD   = 32;

/* коефіцієнти стиску */
const scaleX = SRC_W / CANVAS_W;     // ≈ 0.697674
const scaleY = SRC_H / CANVAS_H;     // ≈ 0.602679

 const uniform = 1;
    const offsetX = 0;
    const offsetY = 0;

   pptx.defineLayout({ name: 'canvas960', width: 10, height: 5.625 });
    pptx.layout = 'canvas960';

    slides.forEach(sl => {
      const s = pptx.addSlide();
      s.background = { fill: sl.backgroundColor || 'FFFFFF' };

      sl.elements.forEach(el => {
  const xIn = ((el.x - PAD) * scaleX + offsetX) / 96;
  const yIn = ((el.y - PAD) * scaleY + offsetY) / 96;
  const wIn =  (el.width  * scaleX) / 96;
  const hIn =  (el.height * scaleY) / 96;

  if (el.type === 'text') {
    s.addText(el.text, {
      x: xIn, y: yIn, w: wIn, h: hIn,
      color: el.color,
      fontSize: el.fontSize * scaleY, // щоб кегль не «розповзався»
      bold: el.bold,
      italic: el.italic,
      align: 'center',
    });
  }
  if (el.type === 'image') {
    s.addImage({ data: el.src, x: xIn, y: yIn, w: wIn, h: hIn });
  }
});
    });

    await pptx.writeFile({ fileName: `${fileName.trim() || 'presentation'}.pptx` });
  };

  /* ───────── import PPTX ───────── */
  const importPptx = async (file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);

      const { data } = await axios.post('http://localhost:5000/api/import', form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSlides(data.slides);
      setFileName(data.title);
      setCurrentSlideIndex(0);
      setSelectedElementId(null);
    } catch (e) {
      console.error(e);
      alert('Не вдалося імпортувати .pptx');
    }
  };

  const onImportClick = () => fileInputRef.current?.click();

  /* ───────── render ───────── */
  return (
    <div className="flex flex-col min-h-screen font-sans text-base">
      {/* top bar */}
      <div
        className="flex px-8 py-4 items-center space-x-8"
        style={{
          background: 'rgba(183,71,42,1)',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 600,
          minHeight: 70,
        }}
      >
        <MenuBar
          onSave={savePresentation}
          onImportPptx={onImportClick}
          onExportPptx={() => {
            setExportFormat('pptx');
            setShowExport(true);
          }}
          onExportPdf={() => {
            setExportFormat('pdf');
            setShowExport(true);
          }}
        />

        {/* hidden input */}
        <input
          type="file"
          accept=".pptx"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) importPptx(file);
            e.target.value = '';
          }}
        />

        <button
          onClick={() => setShowExport(true)}
          className="ml-auto px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-lg"
        >
          Експорт PDF
        </button>
      </div>

      {/* toolbar */}
      <Toolbar
        onAddText={addTextElement}
        onAddImage={addImageElement}
        onChangeColor={c => updateSelectedElement({ color: c })}
        onChangeFontSize={s => updateSelectedElement({ fontSize: s })}
        onToggleBold={() =>
          updateSelectedElement({
            bold: !currentSlide?.elements.find(el => el.id === selectedElementId)?.bold,
          })
        }
        onToggleItalic={() =>
          updateSelectedElement({
            italic: !currentSlide?.elements.find(el => el.id === selectedElementId)?.italic,
          })
        }
        onChangeBackground={changeBackground}
      />

      {/* workspace */}
      <div className="flex flex-1 bg-gray-100">
        <Sidebar
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSelectSlide={setCurrentSlideIndex}
          onAddSlide={addSlide}
        />

        <div className="flex-1 flex justify-center items-start pt-10">
          {currentSlide ? (
            <SlideEditor
              elements={currentSlide.elements}
              onUpdateElements={updateElements}
              backgroundColor={currentSlide.backgroundColor}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Завантаження…
            </div>
          )}
        </div>
      </div>

      {/* export modal */}
      <ExportModal
        show={showExport}
        fileName={fileName}
        setFileName={setFileName}
        onSave={() => {
          if (exportFormat === 'pdf') exportToPDF();
          if (exportFormat === 'pptx') exportToPPTX();
          setShowExport(false);
        }}
        onClose={() => setShowExport(false)}
        format={exportFormat || 'pdf'}
      />
    </div>
  );
};

export default App;
