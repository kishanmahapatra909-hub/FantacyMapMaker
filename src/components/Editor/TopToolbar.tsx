import React from 'react';
import { 
  ChevronLeft, Save, Download, Undo, Redo, 
  ZoomIn, ZoomOut, Play, Maximize, Minimize, Trash2
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';

interface TopToolbarProps {
  onBack: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onBack }) => {
  const { 
    config, setName, zoom, setZoom, 
    saveConfig, loadConfig, setSelectedIds, stage,
    isFullScreen, toggleFullScreen, undo, redo, history, clearObjects,
    setIncinerating, incinerate, ludoActive, snakesActive, tictactoeActive
  } = useEditorStore();

  const [isSaving, setIsSaving] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    saveConfig();
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleExportAsImage = async () => {
    // Check if there are unsaved changes
    const saved = localStorage.getItem('map-builder-config');
    const hasUnsavedChanges = !saved || JSON.stringify(config) !== saved;
    
    if (hasUnsavedChanges) {
      alert('Please save your canvas first.');
      return;
    }

    // Deselect before export to hide transformer
    setSelectedIds([]);
    
    if (ludoActive) {
      const boardElement = document.getElementById('ludo-board-container');
      if (boardElement) {
        try {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(boardElement, {
            useCORS: true,
            backgroundColor: '#000000',
            scale: 2
          });
          const dataURL = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${config.name}-ludo-board.png`;
          link.href = dataURL;
          link.click();
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    if (snakesActive) {
      const boardElement = document.getElementById('snakes-board-container');
      if (boardElement) {
        try {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(boardElement, {
            useCORS: true,
            backgroundColor: '#0a0807',
            scale: 2
          });
          const dataURL = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${config.name}-snakes-board.png`;
          link.href = dataURL;
          link.click();
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    if (tictactoeActive) {
      const boardElement = document.getElementById('tictactoe-board-container');
      if (boardElement) {
        try {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(boardElement, {
            useCORS: true,
            backgroundColor: '#0a0807',
            scale: 2
          });
          const dataURL = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${config.name}-tictactoe-board.png`;
          link.href = dataURL;
          link.click();
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    if (!stage) return;
    
    // Wait for state updates to reflect (hide transformer)
    setTimeout(() => {
      const dataURL = stage.toDataURL({
        pixelRatio: 2, // High DPI capture
        mimeType: 'image/png'
      });
      
      const link = document.createElement('a');
      link.download = `${config.name}-board.png`;
      link.href = dataURL;
      link.click();
    }, 10);
  };

  const handleExportAsPDF = async () => {
    if (ludoActive || snakesActive || tictactoeActive) {
      const elementId = ludoActive 
        ? 'ludo-board-container' 
        : snakesActive 
          ? 'snakes-board-container' 
          : 'tictactoe-board-container';
      const boardElement = document.getElementById(elementId);
      if (boardElement) {
        try {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(boardElement, {
            useCORS: true,
            backgroundColor: ludoActive ? '#000000' : '#0a0807',
            scale: 2
          });
          const dataURL = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(dataURL, 'PNG', (pdfWidth - 180) / 2, (pdfHeight - 180) / 2, 180, 180);
          pdf.save(`${config.name}-${ludoActive ? 'ludo' : snakesActive ? 'snakes' : 'tictactoe'}-board.pdf`);
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    if (!stage) return;
    
    setSelectedIds([]);
    saveConfig();

    setTimeout(() => {
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataURL);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${config.name}-board.pdf`);
    }, 10);
  };

  return (
    <header className="h-16 border-b border-[#3a3022] bg-[#1a1814] flex items-center justify-between px-3 md:px-6 z-50">
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={onBack}
          className="p-1.5 md:p-2 hover:bg-white/5 rounded-sm transition-colors text-stone-500 hover:text-fantasy-gold"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="hidden sm:block h-6 w-px bg-[#3a3022]" />
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex w-8 h-8 bg-fantasy-gold rounded-sm items-center justify-center transform rotate-45 medieval-border shadow-lg">
            <div className="transform -rotate-45 text-[#1a1814] font-bold text-lg font-serif">F</div>
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              value={config.name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-none p-0 text-xs md:text-sm font-serif font-bold tracking-wider text-fantasy-gold focus:ring-0 w-24 sm:w-36 md:w-48 truncate uppercase"
              placeholder="Scroll Title..."
            />
            <span className="text-[8px] md:text-[9px] text-stone-500 uppercase tracking-widest font-bold">Arcane Blueprint</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar max-w-full">
        <div className="flex items-center bg-black/40 rounded px-0.5 md:px-1 py-0.5 md:py-1 border border-[#3a3022]">
          <ToolbarButton 
            onClick={undo} 
            disabled={history.past.length === 0}
            icon={<Undo className="w-3.5 h-3.5 md:w-4 h-4" />} 
            title="Undo" 
          />
          <div className="w-[1px] h-3.5 bg-[#3a3022] mx-0.5"></div>
          <ToolbarButton 
            onClick={redo} 
            disabled={history.future.length === 0}
            icon={<Redo className="w-3.5 h-3.5 md:w-4 h-4" />} 
            title="Redo" 
          />
          <div className="w-[1px] h-3.5 bg-[#3a3022] mx-0.5"></div>
          <ToolbarButton 
            onClick={handleSave} 
            icon={<Save className={`w-3.5 h-3.5 md:w-4 h-4 ${isSaving ? 'text-green-500 scale-125' : 'text-fantasy-gold'} transition-all duration-300`} />} 
            title={isSaving ? "Saved!" : "Save Progress"} 
          />
          {!isMobile && (
            <>
              <div className="w-[1px] h-3.5 bg-[#3a3022] mx-0.5"></div>
              <ToolbarButton 
                onClick={toggleFullScreen} 
                icon={isFullScreen ? <Minimize className="w-3.5 h-3.5 md:w-4 h-4 text-red-400" /> : <Maximize className="w-3.5 h-3.5 md:w-4 h-4 text-fantasy-gold" />} 
                title={isFullScreen ? "Exit Full Screen" : "Board 100% Full Screen"} 
              />
            </>
          )}
        </div>

        <div className="hidden xs:block w-px h-6 bg-[#3a3022]" />

        <div className="hidden sm:flex items-center bg-black/40 rounded px-1 py-1 border border-[#3a3022]">
          <ToolbarButton onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} icon={<ZoomOut className="w-4 h-4" />} title="Zoom Out" />
          <span className="text-[9px] md:text-[10px] px-1 md:px-3 font-mono text-stone-400">{Math.round(zoom * 100)}%</span>
          <ToolbarButton onClick={() => setZoom(Math.min(3, zoom + 0.1))} icon={<ZoomIn className="w-4 h-4" />} title="Zoom In" />
        </div>

        <div className="hidden sm:block w-px h-6 bg-[#3a3022]" />

        <div className="flex items-center bg-black/40 rounded px-0.5 md:px-1 py-0.5 md:py-1 border border-[#3a3022]">
          {isMobile && (
            <>
              <div className="hidden xs:block">
                <ToolbarButton 
                  onClick={toggleFullScreen} 
                  icon={isFullScreen ? <Minimize className="w-3.5 h-3.5 md:w-4 h-4" /> : <Maximize className="w-3.5 h-3.5 md:w-4 h-4" />} 
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"} 
                />
              </div>
              <div className="hidden xs:block w-[1px] h-3.5 bg-[#3a3022] mx-0.5 animate-pulse"></div>
            </>
          )}
          <ToolbarButton 
            onClick={() => {
              incinerate();
            }} 
            icon={<Trash2 className="w-3.5 h-3.5 md:w-4 h-4 text-red-500/70" />} 
            title="Incinerate All" 
          />
        </div>

        <button 
          onClick={handleExportAsImage}
          className="bg-fantasy-gold text-[#1a1814] px-2.5 sm:px-5 py-1.5 md:py-2 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1 md:gap-2 magical-glow"
        >
          <Download className="w-3.5 h-3.5 md:w-4 h-4" /> 
          <span className="hidden xxs:inline">Export</span>
        </button>
      </div>
    </header>
  );
};

const ToolbarButton = ({ icon, title, onClick, disabled }: { icon: React.ReactNode, title: string, onClick?: () => void, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded transition-all ${disabled ? 'text-stone-700 cursor-not-allowed opacity-50' : 'text-stone-500 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
  </button>
);
