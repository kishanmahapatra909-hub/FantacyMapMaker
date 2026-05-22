import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export const GameModeSidebar: React.FC = () => {
  const { ludoActive, setLudoActive, snakesActive, setSnakesActive, tictactoeActive, setTictactoeActive } = useEditorStore();

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Campaign Modes</h3>
        <p className="text-[9px] text-stone-600 italic">Deploy server-enforced custom game engines onto the board.</p>
      </div>

      <div className="space-y-3">
        <button
          id="btn-ludo-toggle"
          onClick={() => {
            if (!ludoActive || confirm("Are you sure you want to start a brand new fresh Ludo game? Any current game progress will be lost.")) {
              setLudoActive(true);
            }
          }}
          className={`w-full py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer ${
            ludoActive 
              ? 'bg-fantasy-gold text-stone-950 border-fantasy-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
              : 'bg-stone-900/40 hover:bg-fantasy-gold/10 text-stone-300 border-stone-800 hover:border-fantasy-gold/50'
          }`}
        >
          LUDO
        </button>

        <button
          id="btn-snakes-toggle"
          onClick={() => {
            if (!snakesActive || confirm("Are you sure you want to start a brand new fresh Snakes & Ladders game? Any current game progress will be lost.")) {
              setSnakesActive(true);
            }
          }}
          className={`w-full py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer ${
            snakesActive 
              ? 'bg-emerald-500 text-stone-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
              : 'bg-stone-900/40 hover:bg-emerald-500/10 text-stone-300 border-stone-800 hover:border-emerald-500/50'
          }`}
        >
          SNAKES & LADDERS
        </button>

        <button
          id="btn-tictactoe-toggle"
          onClick={() => {
            if (!tictactoeActive || confirm("Are you sure you want to start a brand new fresh Tic-Tac-Toe game? Any current game progress will be lost.")) {
              setTictactoeActive(true);
            }
          }}
          className={`w-full py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer ${
            tictactoeActive 
              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
              : 'bg-stone-900/40 hover:bg-amber-500/10 text-stone-300 border-stone-800 hover:border-amber-500/50'
          }`}
        >
          TIC-TAC-TOE
        </button>
      </div>
    </div>
  );
};
