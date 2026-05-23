import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ASSETS, MAP_TEMPLATES, BOARD_SHAPES } from '../../constants';
import { useEditorStore } from '../../store/useEditorStore';
import { Plus, Image as ImageIcon, Search, X, RotateCcw } from 'lucide-react';

export const AssetLibrary: React.FC = () => {
  const { addObject, setBackground, setBoardShape, config, stage, zoom } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = searchQuery.trim()
    ? ASSETS.STAGES.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : ASSETS.STAGES;

  const handleAddAsset = (asset: any) => {
    let centerX = 750; // default board width (1500) / 2
    let centerY = 500; // default board height (1000) / 2

    if (stage) {
      try {
        const stageWidth = stage.width() || (stage.container()?.offsetWidth || 1500);
        const stageHeight = stage.height() || (stage.container()?.offsetHeight || 1000);
        centerX = (stageWidth / zoom) / 2;
        centerY = (stageHeight / zoom) / 2;
      } catch (e) {
        console.error("Error calculating stage center:", e);
      }
    }

    addObject({
      type: asset.type,
      subType: asset.subType,
      src: asset.src,
      x: centerX - 40, // Centering the 80x80 elements
      y: centerY - 40,
      width: 80,
      height: 80,
      fill: '#ffd700',
    });
  };

  return (
    <div className="p-4 space-y-8">
      {/* Templates Section */}
      <section>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-4 flex items-center gap-2">
          <ImageIcon className="w-3 h-3" /> Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label className="group relative aspect-video bg-black/40 border border-[#3a3022] hover:border-fantasy-gold transition-all cursor-pointer flex flex-col items-center justify-center rounded p-2 text-center">
             <Plus className="w-5 h-5 text-stone-500 group-hover:text-fantasy-gold transition-colors" />
             <span className="text-[9px] mt-1 text-stone-500 font-bold uppercase tracking-widest">Invoke GAME MODE</span>
             <input 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setBackground(url);
                }
              }} 
             />
          </label>
          <label className="group relative aspect-video bg-black/40 border border-[#3a3022] hover:border-fantasy-gold transition-all cursor-pointer flex flex-col items-center justify-center rounded p-2 text-center">
             <Plus className="w-5 h-5 text-stone-500 group-hover:text-fantasy-gold transition-colors" />
             <span className="text-[9px] mt-1 text-stone-500 font-bold uppercase tracking-widest">Invoke Artifact</span>
             <input 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  addObject({
                    type: 'stage',
                    subType: 'custom',
                    src: url,
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 200,
                    metadata: { name: 'Custom Artifact', fitToBoard: true }
                  });
                }
              }} 
             />
          </label>
        </div>
        
        <div className="max-h-[185px] overflow-y-auto pr-1 custom-scrollbar mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {MAP_TEMPLATES.map((map) => (
              <button
                key={map.name}
                onClick={() => setBackground(map.url || null)}
                className="relative aspect-video rounded overflow-hidden border border-[#3a3022] hover:border-fantasy-gold transition-all group"
              >
                {map.url ? (
                  <img src={map.url} alt={map.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                ) : (
                  <div className="w-full h-full bg-[#15110f] flex items-center justify-center border border-[#1f1711] select-none">
                    <span className="text-[7px] text-[#cca43b]/40 font-mono uppercase tracking-[0.2em] font-black">CLEAR CANVAS</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all flex items-end p-2">
                  <span className="text-[8px] uppercase tracking-widest text-fantasy-gold font-bold truncate p-1 bg-black/60 rounded-sm w-full text-center">{map.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Board Base Shapes */}
       <section>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold mb-4">Board Decree</h3>
        <div className="grid grid-cols-3 gap-2">
          {BOARD_SHAPES.map((shape) => (
            <button
              key={shape.name}
              onClick={() => setBoardShape(shape.name as any)}
              className="flex flex-col items-center justify-center p-3 bg-black/40 border border-[#3a3022] hover:border-fantasy-gold rounded transition-all group"
            >
              <div className="text-stone-500 group-hover:text-fantasy-gold transition-colors">{shape.icon}</div>
              <span className="text-[9px] mt-2 text-stone-500 font-bold uppercase tracking-tighter">{shape.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Stages Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Elements</h3>
          <div className="flex items-center gap-2">
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[9px] text-[#cca43b] hover:text-white bg-black/40 border border-[#3a3022] hover:border-[#cca43b]/40 px-2.5 py-1 rounded flex items-center gap-1.5 uppercase tracking-wider font-bold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:scale-95"
                title="Clear filter and show previous / default artifacts list"
              >
                <RotateCcw className="w-2.5 h-2.5 text-[#cca43b]" />
                Refresh Search
              </button>
            )}
            <span className="text-[9px] text-stone-600 font-medium italic">
              {filteredAssets.length} Artifacts Found
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative mb-4 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-500 group-focus-within:text-fantasy-gold transition-colors" />
          <input 
            type="text"
            placeholder="Seek artifacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-[#3a3022] focus:border-fantasy-gold/50 focus:outline-none rounded py-2 pl-9 pr-8 text-[11px] text-stone-300 placeholder:text-stone-700 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-600 hover:text-stone-400 transition-colors"
              title="Refresh / Clear search"
            >
              <RotateCcw className="w-3 h-3 hover:rotate-180 transition-all duration-300" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredAssets.map((asset, i) => (
            <AssetButton key={`${asset.name}-${asset.subType}-${i}`} asset={asset} onClick={() => handleAddAsset(asset)} />
          ))}
          {filteredAssets.length === 0 && (
            <div className="col-span-2 py-8 text-center border border-dashed border-[#3a3022] rounded flex flex-col items-center gap-3 bg-[#1a1512]/20">
              <Search className="w-5 h-5 text-stone-600" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-[#cca43b]/80 font-bold">No relics match your search</p>
                <p className="text-[9px] text-stone-500 italic">Try searching for other mythical creatures or gear</p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-1 px-4 py-1.5 bg-[#cca43b]/10 hover:bg-[#cca43b]/25 text-[#cca43b] hover:text-white rounded text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 font-bold border border-[#cca43b]/20 hover:border-[#cca43b]"
              >
                <RotateCcw className="w-3 h-3" /> Refresh Search
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const AssetButton = ({ asset, onClick }: { asset: any, onClick: () => void }) => {
  const lastTapRef = React.useRef<number>(0);

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      onClick();
    }
    lastTapRef.current = now;
  };

  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('asset', JSON.stringify({
          type: asset.type,
          subType: asset.subType,
          src: asset.src
        }));
      }}
      onDoubleClick={onClick}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col items-center gap-3 p-4 parchment-texture medieval-border rounded cursor-move hover:scale-105 transition-all group"
    >
      <div className="text-[#654321] group-hover:scale-110 transition-all font-display text-2xl w-14 h-14 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        {asset.src ? (
          <img src={asset.src} alt={asset.name} className="w-full h-full object-contain pointer-events-none" />
        ) : (
          asset.icon
        )}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-widest text-[#654321] text-center px-1 select-none">
        {asset.name}
      </span>
    </button>
  );
};
