import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Trash2, Move, RotateCw, Maximize2, Dices, Sparkles, Trophy, Settings2, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ASSETS } from '../../constants';

export const PropertiesPanel: React.FC = () => {
  const { 
    selectedIds, 
    config, 
    updateObject, 
    removeObject, 
    deleteSelected, 
    ludoActive, 
    setLudoActive,
    snakesActive,
    setSnakesActive,
    tictactoeActive,
    setTictactoeActive,
    incinerate
  } = useEditorStore();
  
  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col justify-between h-full p-5 space-y-6">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="w-14 h-14 border border-[#3a3022] rounded-full flex items-center justify-center bg-black/20">
              <Settings2 className="w-5 h-5 opacity-40 animate-spin-slow text-stone-600" />
            </div>
            <p className="text-[9px] uppercase tracking-[0.25em] font-bold italic leading-relaxed text-stone-500">
              Whisper a choice to see its properties in the grimoire
            </p>
          </div>

          {/* Quick Campaign Access */}
          <div className="bg-fantasy-gold/5 border border-fantasy-gold/20 p-4 rounded-lg space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="w-3.5 h-3.5 text-fantasy-gold" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-fantasy-gold">Active Campaigns</h4>
            </div>
            <p className="text-[9px] text-stone-500 italic leading-relaxed">
              Unleash board simulation algorithms to play interactive tabletop games directly on your drafting canvas.
            </p>

            <button
              id="properties-deploy-ludo"
              onClick={() => setLudoActive(!ludoActive)}
              className={`w-full py-2.5 rounded text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                ludoActive
                  ? 'bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-900/40'
                  : 'bg-fantasy-gold/15 hover:bg-fantasy-gold/25 text-fantasy-gold border border-fantasy-gold/30'
              }`}
            >
              <Dices className="w-3.5 h-3.5" />
              {ludoActive ? 'Forfeit Ludo Game' : 'Deploy Ludo Citadel'}
            </button>

            <button
              id="properties-deploy-snakes"
              onClick={() => setSnakesActive(!snakesActive)}
              className={`w-full py-2.5 rounded text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                snakesActive
                  ? 'bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-900/40'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {snakesActive ? 'Forfeit Snakes Game' : 'Deploy Snakes Domain'}
            </button>

            <button
              id="properties-deploy-tictactoe"
              onClick={() => setTictactoeActive(!tictactoeActive)}
              className={`w-full py-2.5 rounded text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                tictactoeActive
                  ? 'bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-900/40'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              {tictactoeActive ? 'Forfeit TicTacToe' : 'Deploy TicTacToe Arena'}
            </button>
          </div>
        </div>

        {/* Board Purging Panel */}
        <div className="bg-fantasy-gold/5 border border-fantasy-gold/20 p-4 rounded-lg space-y-4 text-center mt-auto">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-serif">Board Purging</h4>
          </div>
          <p className="text-[9px] text-stone-500 italic leading-relaxed">
            Incinerate every legacy relic and waypoint to return the drawing canvas back to pristine parchment.
          </p>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to incinerate all artifacts and relics on the board?')) {
                incinerate();
              }
            }}
            disabled={config.objects.length === 0}
            className={`w-full py-2.5 rounded text-[10px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
              config.objects.length > 0 
                ? 'bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-900/40 cursor-pointer' 
                : 'bg-stone-900/40 text-stone-600 border border-stone-950 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Incinerate Board Relics
          </button>
        </div>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    return (
      <div className="p-5 space-y-8 flex flex-col h-full">
        <div className="bg-fantasy-gold/5 border border-fantasy-gold/20 p-4 rounded-lg text-center space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-fantasy-gold">Multiple Artifacts Selected</h3>
          <p className="text-[10px] text-stone-500 italic">Harmonizing properties across multiple essences is beyond current alchemy.</p>
          
          <div className="pt-6 border-t border-[#3a3022]">
            <button 
              onClick={() => deleteSelected()}
              className="w-full py-3 bg-red-950/40 text-red-500 border border-red-900/50 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-900/60 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3 h-3" /> Incinerate Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedId = selectedIds[0];
  const selectedObject = config.objects.find((o) => o.id === selectedId);

  if (!selectedObject) return null;

  // Find asset info from constants to get human-readable name and image source
  const assetInfo = ASSETS.STAGES.find(a => a.subType === selectedObject.subType);
  const displayName = selectedObject.metadata?.name || assetInfo?.name || selectedObject.subType.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const displaySrc = selectedObject.src || assetInfo?.src;

  return (
    <div className="p-5 space-y-8 flex flex-col h-full">
      <div className="bg-fantasy-gold/5 border border-fantasy-gold/20 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-fantasy-gold">Artifact Decree</h3>
          <span className="px-2 py-0.5 bg-fantasy-gold text-[#1a1814] text-[8px] font-bold rounded uppercase">{selectedObject.subType}</span>
        </div>

        {/* Selected Artifact Visual Display: Name & Picture */}
        <div className="flex flex-col items-center justify-center p-4 bg-black/40 border border-[#3a3022] rounded-lg mb-6 text-center space-y-3">
          {displaySrc ? (
            <div className="relative w-20 h-20 border-2 border-fantasy-gold/40 rounded-full flex items-center justify-center bg-black/50 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all">
              <img 
                src={displaySrc} 
                alt={displayName} 
                className="w-16 h-16 object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-20 h-20 border border-[#3a3022] rounded-full flex items-center justify-center bg-black/20">
              <Settings2 className="w-8 h-8 opacity-40 text-stone-600" />
            </div>
          )}
          <div className="space-y-1">
            <h4 className="text-xs font-serif font-bold text-[#e0d8c3] tracking-wide">
              {displayName}
            </h4>
            <span className="inline-block text-[8px] uppercase tracking-widest text-stone-500 font-mono">
              {selectedObject.type} Essence
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Transform Group */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase font-bold tracking-widest text-stone-500 flex items-center gap-2">
              <Move className="w-3 h-3" /> Essence Position
            </label>
            <div className="grid grid-cols-2 gap-3">
              <InputGroup 
                label="Latitude" 
                value={Math.round(selectedObject.x)} 
                onChange={(v) => updateObject(selectedObject.id, { x: parseInt(v) })} 
              />
              <InputGroup 
                label="Longitude" 
                value={Math.round(selectedObject.y)} 
                onChange={(v) => updateObject(selectedObject.id, { y: parseInt(v) })} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase font-bold tracking-widest text-stone-500 flex items-center gap-2">
              <Maximize2 className="w-3 h-3" /> Spatial Magnitude
            </label>
            <div className="grid grid-cols-2 gap-3">
              <InputGroup 
                label="Width" 
                value={Math.round(selectedObject.width || 0)} 
                onChange={(v) => updateObject(selectedObject.id, { width: parseInt(v) })} 
              />
              <InputGroup 
                label="Height" 
                value={Math.round(selectedObject.height || 0)} 
                onChange={(v) => updateObject(selectedObject.id, { height: parseInt(v) })} 
              />
            </div>
            {selectedObject.src && (
              <button
                onClick={() => updateObject(selectedId, { metadata: { ...selectedObject.metadata, fitToBoard: true } })}
                className="w-full mt-2 py-2 bg-fantasy-gold/10 hover:bg-fantasy-gold/20 text-fantasy-gold border border-fantasy-gold/30 rounded text-[9px] uppercase font-bold tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-3 h-3" /> Fit to Board Essence
              </button>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase font-bold tracking-widest text-stone-500 flex items-center gap-2">
              <RotateCw className="w-3 h-3" /> Arcane Rotation
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={selectedObject.rotation || 0}
                onChange={(e) => updateObject(selectedObject.id, { rotation: parseInt(e.target.value) })}
                className="flex-1 h-1 bg-black rounded appearance-none cursor-pointer accent-fantasy-gold"
              />
              <span className="text-[10px] font-mono text-fantasy-gold">{selectedObject.rotation || 0}°</span>
            </div>
          </div>

        </div>
        
        <div className="mt-8 border-t border-[#3a3022] pt-6">
          <button 
            onClick={() => {
              deleteSelected();
            }}
            className="w-full py-3 bg-red-950/40 text-red-500 border border-red-900/50 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-red-900/60 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3 h-3" /> Incinerate Artifact
          </button>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[7px] uppercase text-stone-600 font-bold tracking-widest">{label}</span>
    <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-[#3a3022] focus-within:border-fantasy-gold transition-all">
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-none text-[11px] focus:ring-0 p-0 text-[#e0d8c3] font-mono"
      />
    </div>
  </div>
);
