import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
  selectedCount: number;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction, selectedCount }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: y, left: x });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedLeft = x;
      let adjustedTop = y;

      if (x + rect.width > viewportWidth) {
        adjustedLeft = viewportWidth - rect.width - 16;
      }
      if (y + rect.height > viewportHeight) {
        adjustedTop = viewportHeight - rect.height - 16;
      }

      setCoords({ top: adjustedTop, left: adjustedLeft });
    }
  }, [x, y]);

  // Use the exact singular/plural representation
  const deleteLabel = selectedCount > 1 ? 'Delete Artifacts' : 'Delete Artifact';

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -5 }}
        className="context-menu-container fixed z-[100] bg-[#1a1614] border border-[#3a3022] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden min-w-[220px] backdrop-blur-md"
        style={{ top: coords.top, left: coords.left }}
      >
        <div className="px-4 py-3 text-[10px] uppercase font-semibold tracking-wider text-stone-500 bg-black/40 border-b border-[#3a3022] flex justify-between items-center select-none">
          <span>Actions ({selectedCount})</span>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-stone-500 hover:text-stone-300 transition-colors p-0.5 rounded hover:bg-white/5"
            aria-label="Close menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="p-1">
          <button
            type="button"
            onClick={() => {
              onAction('delete');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-3 text-sm font-medium transition-all rounded-lg text-[#f87171] hover:bg-red-500/10 active:bg-red-500/20 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 text-[#ef4444]" />
            <span>{deleteLabel}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
