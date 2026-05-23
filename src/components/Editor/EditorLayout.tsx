import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, Box, Settings2, Save, Download, 
  Undo, Redo, ZoomIn, ZoomOut, Play, ChevronLeft,
  Image as ImageIcon, Shapes, Pin, PinOff
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { CanvasArea } from './CanvasArea';
import { AssetLibrary } from './AssetLibrary';
import { GameModeSidebar } from './GameModeSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { TopToolbar } from './TopToolbar';
import { cn } from '../../lib/utils';
import { ShareButtons } from './ShareButtons';

interface EditorLayoutProps {
  onBack: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ onBack }) => {
  const [activeLeftTab, setActiveLeftTab] = useState<'assets' | 'templates' | 'shapes'>('assets');
  const { config, isFullScreen } = useEditorStore();
  
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [isLeftPinned, setIsLeftPinned] = useState(true);
  const [isRightPinned, setIsRightPinned] = useState(true);

  // Responsive state logic
  const [isMobile, setIsMobile] = useState(false);
  const [isLeftOpenMobile, setIsLeftOpenMobile] = useState(false);
  const [isRightOpenMobile, setIsRightOpenMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync fullscreen and sidebar pinned status for superior desktop experience
  useEffect(() => {
    if (isFullScreen) {
      setIsLeftPinned(false);
      setIsRightPinned(false);
    } else {
      setIsLeftPinned(true);
      setIsRightPinned(true);
    }
  }, [isFullScreen]);

  const sidebarVariants = {
    visible: { x: 0, opacity: 1 },
    hiddenLeft: { x: '-100%', opacity: 0 },
    hiddenRight: { x: '100%', opacity: 0 },
  };

  const toolbarVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: '-100%', opacity: 0 },
  };

  // Determine actual sidebar visible status
  const isLeftSidebarVisible = isMobile 
    ? isLeftOpenMobile 
    : (isLeftPinned || isLeftHovered);

  const isRightSidebarVisible = isMobile 
    ? isRightOpenMobile 
    : (isRightPinned || isRightHovered);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0908] text-[#e0d8c3] selection:bg-fantasy-gold selection:text-black font-sans overflow-hidden relative">
      {/* Top Toolbar */}
      <motion.div
        onMouseEnter={() => setIsTopHovered(true)}
        onMouseLeave={() => setIsTopHovered(false)}
        animate={isFullScreen && !isTopHovered ? "hidden" : "visible"}
        variants={toolbarVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "z-[60]",
          isFullScreen && "absolute top-0 left-0 right-0"
        )}
      >
        <TopToolbar onBack={onBack} />
      </motion.div>

      {/* Trigger area for Top Toolbar in Fullscreen */}
      {isFullScreen && (
        <div 
          className="absolute top-0 left-0 right-0 h-4 z-[55]" 
          onMouseEnter={() => setIsTopHovered(true)}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <motion.aside 
          onMouseEnter={() => setIsLeftHovered(true)}
          onMouseLeave={() => setIsLeftHovered(false)}
          animate={isLeftSidebarVisible ? "visible" : "hiddenLeft"}
          variants={sidebarVariants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            isMobile ? "w-64" : "w-80",
            "border-r border-[#3a3022] bg-[#1a1814] flex flex-col z-50",
            (!isLeftPinned || isFullScreen) && "absolute left-0 top-0 bottom-0 shadow-2xl",
            isMobile && "fixed left-0 top-16 bottom-8 z-[50] shadow-[10px_0_30px_rgba(0,0,0,0.8)] border-r border-[#3a3022]/60 h-[calc(100vh-6rem)]"
          )}
        >
          <div className="flex items-center border-b border-[#3a3022] bg-black/20 pr-2">
            <div className="flex-1 flex">
              <TabButton 
                active={activeLeftTab === 'assets'} 
                onClick={() => setActiveLeftTab('assets')}
                icon={<Box className="w-4 h-4" />}
                label="Asset Grimoire"
              />
              <TabButton 
                active={activeLeftTab === 'templates'} 
                onClick={() => setActiveLeftTab('templates')}
                icon={<Library className="w-4 h-4" />}
                label="GAME MODE"
              />
            </div>
            {!isMobile && (
              <button
                onClick={() => setIsLeftPinned(!isLeftPinned)}
                type="button"
                className={cn(
                  "p-1.5 rounded border transition-all flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider",
                  isLeftPinned 
                    ? "text-fantasy-gold border-fantasy-gold bg-fantasy-gold/10 shadow-[0_0_8px_rgba(212,175,55,0.25)]" 
                    : "text-stone-500 border-stone-800 bg-stone-900/40 hover:text-stone-300 hover:bg-white/5"
                )}
                title={isLeftPinned ? "Collapse Asset Panel (Auto-Hide)" : "Pin Asset Panel (Locked)"}
              >
                {isLeftPinned ? <Pin className="w-3.5 h-3.5 fill-fantasy-gold/25 text-fantasy-gold" /> : <PinOff className="w-3.5 h-3.5" />}
                <span className="text-[9px]">{isLeftPinned ? "PINNED" : "COLLAPSE"}</span>
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeLeftTab === 'assets' && <AssetLibrary key="assets" />}
              {activeLeftTab === 'templates' && <GameModeSidebar key="templates" />}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Trigger area for Left Sidebar */}
        {!isMobile && !isLeftPinned && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-4 z-40 cursor-w-resize bg-fantasy-gold/[0.02] border-r border-[#3a3022]/20 shadow-[-10px_0_15px_rgba(0,0,0,0.5)]" 
            onMouseEnter={() => setIsLeftHovered(true)}
          />
        )}

        {/* Dismissal Backdrop for Mobile when panel is active */}
        {isMobile && (isLeftOpenMobile || isRightOpenMobile) && (
          <div 
            className="absolute inset-0 bg-black/70 z-40 backdrop-blur-sm transition-all"
            onClick={() => {
              setIsLeftOpenMobile(false);
              setIsRightOpenMobile(false);
            }}
          />
        )}

        {/* Center Canvas Area */}
        <main className="flex-1 relative bg-[#070605] flex items-center justify-center overflow-hidden">
           {/* Grid Background Effect */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3a3022 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <CanvasArea />
        </main>

        {/* Right Sidebar */}
        <motion.aside 
          onMouseEnter={() => setIsRightHovered(true)}
          onMouseLeave={() => setIsRightHovered(false)}
          animate={isRightSidebarVisible ? "visible" : "hiddenRight"}
          variants={sidebarVariants}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            isMobile ? "w-64" : "w-80",
            "border-l border-[#3a3022] bg-[#1a1814] flex flex-col z-50",
            (!isRightPinned || isFullScreen) && "absolute right-0 top-0 bottom-0 shadow-2xl",
            isMobile && "fixed right-0 top-16 bottom-8 z-[50] shadow-[-10px_0_30px_rgba(0,0,0,0.8)] border-l border-[#3a3022]/60 h-[calc(100vh-6rem)]"
          )}
        >
          <div className="flex items-center border-b border-[#3a3022] bg-black/20 pr-2">
            <div className="flex-1 flex items-center gap-2 py-3 px-4 text-fantasy-gold text-[10px] font-bold uppercase tracking-[0.2em]">
              <Settings2 className="w-4 h-4 text-fantasy-gold" />
              <span>Decree</span>
            </div>
            {!isMobile && (
              <button
                onClick={() => setIsRightPinned(!isRightPinned)}
                type="button"
                className={cn(
                  "p-1.5 rounded border transition-all flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider",
                  isRightPinned 
                    ? "text-fantasy-gold border-fantasy-gold bg-fantasy-gold/10 shadow-[0_0_8px_rgba(212,175,55,0.25)]" 
                    : "text-stone-500 border-stone-800 bg-stone-900/40 hover:text-stone-300 hover:bg-white/5"
                )}
                title={isRightPinned ? "Collapse Properties Panel (Auto-Hide)" : "Pin Properties Panel (Locked)"}
              >
                {isRightPinned ? <Pin className="w-3.5 h-3.5 fill-fantasy-gold/25 text-fantasy-gold" /> : <PinOff className="w-3.5 h-3.5" />}
                <span className="text-[9px]">{isRightPinned ? "PINNED" : "COLLAPSE"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <PropertiesPanel key="props" />
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Trigger area for Right Sidebar */}
        {!isMobile && !isRightPinned && (
          <div 
            className="absolute right-0 top-0 bottom-0 w-4 z-40 cursor-e-resize bg-fantasy-gold/[0.02] border-l border-[#3a3022]/20 shadow-[10px_0_15px_rgba(0,0,0,0.5)]" 
            onMouseEnter={() => setIsRightHovered(true)}
          />
        )}
      </div>

      {/* Floating Panel Triggers for Mobile / Tablets */}
      {isMobile && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-[#14110f]/95 border-2 border-[#524430] p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.9)] backdrop-blur-md">
          <button 
            onClick={() => {
              setIsLeftOpenMobile(!isLeftOpenMobile);
              setIsRightOpenMobile(false);
            }}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-serif font-black uppercase tracking-widest transition-all",
              isLeftOpenMobile 
                ? "bg-fantasy-gold text-[#1a120b] shadow-[0_0_15px_rgba(212,175,55,0.6)]" 
                : "text-stone-400 hover:text-white"
            )}
          >
            🛡️ Grimoire
          </button>
          <div className="w-[2px] h-4 bg-[#3a3022]" />
          <button 
            onClick={() => {
              setIsRightOpenMobile(!isRightOpenMobile);
              setIsLeftOpenMobile(false);
            }}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-serif font-black uppercase tracking-widest transition-all",
              isRightOpenMobile 
                ? "bg-fantasy-gold text-[#1a120b] shadow-[0_0_15px_rgba(212,175,55,0.6)]" 
                : "text-stone-400 hover:text-white"
            )}
          >
            📜 Decree
          </button>
        </div>
      )}

      {/* Status Bar */}
      {!isFullScreen && (
        <footer className="h-10 md:h-12 border-t border-[#3a3022] bg-[#0a0908] flex flex-wrap items-center justify-between px-4 text-[9px] uppercase tracking-[0.2em] text-stone-500 font-serif py-1.5 gap-2">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <img 
                src="https://i.postimg.cc/rpyZ4WwW/Fantacy.png" 
                alt="FantacyMapMaker" 
                className="h-4.5 w-auto rounded-sm"
                referrerPolicy="no-referrer"
              />
              <span className="font-serif text-[10px] font-bold text-fantasy-gold uppercase tracking-[0.1em]">FantacyMapMaker</span>
            </div>
            <div className="hidden xxs:block w-[1px] h-3 bg-[#3a3022]"></div>
            <span className="hidden xxs:inline">Artifacts: {config.objects.length}</span>
          </div>

          {/* Share Your Creativity Section */}
          <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded border border-[#3a3022]/60 shrink-0">
            <span className="text-[#e2d8c3]/60 font-sans tracking-wide text-[10px] lowercase normal-case flex items-center gap-1">
              Share your creativity:
            </span>
            <ShareButtons />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden xs:inline">v1.0.0 Alchemist Edition</span>
          </div>
        </footer>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative",
      active ? "text-fantasy-gold bg-black/20" : "text-stone-500 hover:text-stone-300 hover:bg-white/5"
    )}
  >
    {icon}
    <span>{label}</span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-fantasy-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]" 
      />
    )}
  </button>
);
