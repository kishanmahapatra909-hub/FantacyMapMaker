import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  User, 
  Trophy, 
  Gamepad2, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export const TicTacToeGame: React.FC = () => {
  const { setTictactoeActive } = useEditorStore();

  // Core Game State
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<'X' | 'O' | 'Draw' | null>(null);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [muted, setMuted] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isOnlyMobile, setIsOnlyMobile] = useState<boolean>(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Sound synthesis function
  const playSound = (type: 'mark' | 'win' | 'draw' | 'error' | 'init') => {
    if (muted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'mark') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'win') {
        osc.type = 'triangle';
        // Elegant ascending arpeggio
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'draw') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(349.23, now); // F4
        osc.frequency.setValueAtTime(311.13, now + 0.15); // Eb4
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'init') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.error('Audio synthesizer failed to execute sound', e);
    }
  };

  const getCellValForAscii = (boardState: (string | null)[], idx: number) => {
    const val = boardState[idx];
    if (val === 'X') return '  X  ';
    if (val === 'O') return '  O  ';
    return ` (${idx + 1}) `;
  };

  const generateAsciiBoard = (boardState: (string | null)[]) => {
    return [
      ' ─── Current Board ───',
      `  ${getCellValForAscii(boardState, 0)}│${getCellValForAscii(boardState, 1)}│${getCellValForAscii(boardState, 2)}`,
      ' ─────┼─────┼─────',
      `  ${getCellValForAscii(boardState, 3)}│${getCellValForAscii(boardState, 4)}│${getCellValForAscii(boardState, 5)}`,
      ' ─────┼─────┼─────',
      `  ${getCellValForAscii(boardState, 6)}│${getCellValForAscii(boardState, 7)}│${getCellValForAscii(boardState, 8)}`,
      ' ─────────────────────'
    ];
  };

  // Autoscroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Window resize effect for mobile specific detection matching screens (< 768px for phone only, keep tablet at >= 768px)
  useEffect(() => {
    const checkOnlyMobile = () => {
      setIsOnlyMobile(window.innerWidth < 768);
    };
    checkOnlyMobile();
    window.addEventListener('resize', checkOnlyMobile);
    return () => window.removeEventListener('resize', checkOnlyMobile);
  }, []);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem('fantasy_tictactoe_game_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBoard(parsed.board || Array(9).fill(null));
        setCurrentPlayer(parsed.currentPlayer || 'X');
        setWinner(parsed.winner !== undefined ? parsed.winner : null);
        setLogs(parsed.logs || []);
        setMuted(parsed.muted || false);
        return;
      } catch (e) {
        console.error('Could not parse saved Tic-Tac-Toe state', e);
      }
    }

    // Default Initialization Logs
    const initialLogs = [
      '==================================================',
      '🎮 WELCOME TO THE MYSTICAL TIC-TAC-TOE DUNGEON',
      '==================================================',
      'Challenge your partner in local Pass-and-Play combat!',
      'Place tokens using numbers 1-9 on your keyboard or',
      'by clicking directly on the parchment board coordinates.',
      '',
      ...generateAsciiBoard(Array(9).fill(null)),
      '',
      `🔹 PLAYER X's TURN 🔹`,
      'Please enter a number (1-9) to place your mark:'
    ];
    setLogs(initialLogs);
    playSound('init');
  }, []);

  // Sync state to local storage
  const saveState = (
    newBoard: (string | null)[],
    newPlayer: 'X' | 'O',
    newWinner: 'X' | 'O' | 'Draw' | null,
    newLogs: string[]
  ) => {
    try {
      localStorage.setItem('fantasy_tictactoe_game_state_v2', JSON.stringify({
        board: newBoard,
        currentPlayer: newPlayer,
        winner: newWinner,
        logs: newLogs,
        muted
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Formulate log addition Helper
  const addLog = (msg: string | string[]) => {
    setLogs(prev => {
      const next = typeof msg === 'string' ? [...prev, msg] : [...prev, ...msg];
      return next;
    });
  };

  // Check board state for winners
  const checkWinnerStatus = (boardState: (string | null)[]) => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a] as 'X' | 'O';
      }
    }
    // Check draw
    if (boardState.every(cell => cell !== null)) {
      return 'Draw';
    }
    return null;
  };

  // Perform turn gameplay action
  const makeMove = (slotNum: number) => {
    if (winner) {
      playSound('error');
      addLog([
        `⚠️ Game campaign is already completed!`,
        `Click the REFRESH button to launch a new campaign.`
      ]);
      return;
    }

    const idx = slotNum - 1;
    // Check cell occupation
    if (board[idx] !== null) {
      playSound('error');
      addLog([
        `⚠️ Slot ${slotNum} already taken! Choose an empty slot.`,
        '',
        `Please enter a number (1-9) to place your mark:`
      ]);
      return;
    }

    // Execute mark
    const newBoard = [...board];
    newBoard[idx] = currentPlayer;
    const gameResult = checkWinnerStatus(newBoard);

    playSound('mark');
    setBoard(newBoard);

    const matchLogs = [
      `🔹 Player ${currentPlayer} captures slot ${slotNum}!`,
      ''
    ];

    if (gameResult === 'X' || gameResult === 'O') {
      // Current player wins
      setWinner(gameResult);
      playSound('win');
      const winLogs = [
        ...matchLogs,
        ...generateAsciiBoard(newBoard),
        '',
        `🎉 GAME OVER: PLAYER ${gameResult} WINS! 🎉`,
        '=================================================='
      ];
      setLogs(prev => {
        const next = [...prev, ...winLogs];
        saveState(newBoard, currentPlayer, gameResult, next);
        return next;
      });
    } else if (gameResult === 'Draw') {
      // Is draw
      setWinner('Draw');
      playSound('draw');
      const drawLogs = [
        ...matchLogs,
        ...generateAsciiBoard(newBoard),
        '',
        `🤝 GAME OVER: IT'S A DRAW! 🤝`,
        '=================================================='
      ];
      setLogs(prev => {
        const next = [...prev, ...drawLogs];
        saveState(newBoard, currentPlayer, 'Draw', next);
        return next;
      });
    } else {
      // Continue next turn
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      const continueLogs = [
        ...matchLogs,
        ...generateAsciiBoard(newBoard),
        '',
        `🔹 PLAYER ${nextPlayer}'s TURN 🔹`,
        'Please enter a number (1-9) to place your mark:'
      ];
      setLogs(prev => {
        const next = [...prev, ...continueLogs];
        saveState(newBoard, nextPlayer, null, next);
        return next;
      });
    }
  };

  // Keyboard Submission Form Handler
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = terminalInput.trim();
    setTerminalInput('');

    if (!input) return;

    addLog(`> ${input}`);

    // Parse value
    const num = parseInt(input, 10);
    if (isNaN(num) || num < 1 || num > 9) {
      playSound('error');
      addLog([
        `⚠️ Invalid Slot choosing: "${input}". Select an empty coordinate (1-9).`,
        '',
        `Please enter a number (1-9) to place your mark:`
      ]);
      return;
    }

    makeMove(num);
  };

  // Restart / Reset Game complete fresh state
  const handleRestart = () => {
    const freshBoard = Array(9).fill(null);
    setBoard(freshBoard);
    setCurrentPlayer('X');
    setWinner(null);
    setTerminalInput('');

    const initialLogs = [
      '==================================================',
      '🎮 MYSTICAL TIC-TAC-TOE CAMPAIGN REBOOTED',
      '==================================================',
      'Deploying fresh combat board layout...',
      '',
      ...generateAsciiBoard(freshBoard),
      '',
      `🔹 PLAYER X's TURN 🔹`,
      'Please enter a number (1-9) to place your mark:'
    ];
    setLogs(initialLogs);
    playSound('init');
    
    try {
      localStorage.setItem('fantasy_tictactoe_game_state_v2', JSON.stringify({
        board: freshBoard,
        currentPlayer: 'X',
        winner: null,
        logs: initialLogs,
        muted
      }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row w-full max-w-7xl mx-auto gap-5 p-3 bg-[#0a0807] rounded-xl border border-[#2b221a] text-stone-300 font-sans shadow-2xl relative xl:h-[652px] items-stretch overflow-hidden">
      
      {/* Sound Controller Float */}
      <button 
        onClick={() => setMuted(!muted)}
        className="hidden md:block absolute top-4 right-4 p-2 bg-stone-900/95 hover:bg-stone-800 border border-[#3e3226] text-stone-400 rounded-full z-30 transition-colors cursor-pointer"
        title={muted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
      >
        {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
      </button>

      {/* LEFT PANE: ENTIRE VISUAL PARCHMENT BOARD */}
      <div className="flex-1 flex flex-col justify-center items-center p-3 sm:p-6 bg-[#1a130f] rounded-lg border border-[#3d2e23] relative overflow-hidden shadow-inner min-h-[350px]">
        
        {/* Background Fantasy Aesthetic */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,94,60,0.1)_0%,transparent_100%)] pointer-events-none" />
        
        {/* Grid Title Card */}
        <div className="hidden md:block mb-4 text-center z-10">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Gamepad2 className="w-4 h-4 text-[#cca43b]" />
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-[#cca43b] font-serif">
              Tic-Tac-Toe Arena
            </h2>
          </div>
          <p className="text-[10px] text-stone-500 italic font-mono uppercase tracking-widest">
            {winner ? 'Campaign Finalized' : `Awaiting player ${currentPlayer}`}
          </p>
        </div>

        {/* PHYSICAL 3x3 PARCHMENT BOARD */}
        <div className="relative w-full max-w-[320px] aspect-square rounded-lg border-2 border-[#cca43b]/40 bg-[#120a06]/95 p-3 shadow-xl flex flex-col justify-between z-10">
          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
            {board.map((cell, idx) => {
              const coordinate = idx + 1;
              const isEmpty = cell === null;

              return (
                <button
                  key={idx}
                  onClick={() => makeMove(coordinate)}
                  className={`relative flex items-center justify-center rounded border transition-all duration-200 cursor-pointer ${
                    cell === 'X' 
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-400' 
                      : cell === 'O' 
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-400' 
                        : 'bg-stone-900/40 border-[#3d2e23] hover:border-[#cca43b]/60 hover:bg-[#1a130f]'
                  }`}
                >
                  {/* Grid number inside parentheses or heavy bold mark */}
                  {isEmpty ? (
                    <span className="text-stone-600 font-mono text-[11px] font-bold select-none opacity-80 group-hover:opacity-100 transition-opacity">
                      ({coordinate})
                    </span>
                  ) : (
                    <motion.span 
                      initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className={`text-2xl font-extrabold tracking-tight ${cell === 'X' ? 'font-serif text-[#cca43b]' : 'font-sans text-rose-500'}`}
                    >
                      {cell}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Turn indicator ribbon */}
        <div className="hidden md:flex mt-5 w-full max-w-[320px] flex justify-between gap-3 text-center z-10 font-mono">
          <div className={`flex-1 py-1 px-2 rounded border uppercase text-[9px] tracking-wide font-black ${
            currentPlayer === 'X' && !winner 
              ? 'bg-amber-950/20 border-amber-500 text-amber-400 animate-pulse' 
              : 'bg-black/40 border-stone-800 text-stone-600'
          }`}>
            ⚔️ Player X
          </div>
          <div className={`flex-1 py-1 px-2 rounded border uppercase text-[9px] tracking-wide font-black ${
            currentPlayer === 'O' && !winner 
              ? 'bg-rose-950/20 border-rose-500 text-rose-400 animate-pulse' 
              : 'bg-black/40 border-stone-800 text-stone-600'
          }`}>
            🛡️ Player O
          </div>
        </div>
      </div>

      {/* RIGHT PANE: THE CONSOLE SIMULATOR & CONTROL DECK */}
      <div className="hidden md:flex w-full xl:w-[380px] xl:min-w-[380px] flex-col bg-[#120e0c] rounded-lg border border-[#2b221a] p-3 shadow-inner">
        
        {/* Terminal Header Info */}
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-stone-900 justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-stone-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] font-mono text-stone-400">
              Tic_Tac_Toe_Console.log
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[8px] font-mono text-stone-500 font-bold uppercase">Ready</span>
          </div>
        </div>

        {/* STATUS BRIEF */}
        <div className="bg-black/40 border border-stone-900 rounded p-2 mb-3">
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono uppercase">
            <div className="flex flex-col">
              <span className="text-stone-500">Current Arena</span>
              <span className="text-stone-300 font-bold">Griddled Ruins</span>
            </div>
            <div className="flex flex-col">
              <span className="text-stone-500 font-medium">Turn Active</span>
              <span className={`font-black ${winner ? 'text-stone-400' : 'text-[#cca43b] animate-pulse'}`}>
                {winner ? 'Finished' : `Player ${currentPlayer}`}
              </span>
            </div>
          </div>
        </div>

        {/* PARCHMENT LOGBOX TERMINAL */}
        <div 
          ref={logContainerRef} 
          className="flex-1 min-h-[180px] h-0 overflow-y-auto bg-black/95 rounded border border-stone-900 p-2.5 font-mono text-[9px] space-y-1.5 custom-scrollbar leading-relaxed mb-3 shadow-inner"
        >
          {isOnlyMobile ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <ShieldAlert className="w-6 h-6 text-yellow-500/80 mb-2 animate-pulse" />
              <p className="text-[10px] uppercase font-black tracking-widest text-[#cca43b] mb-1">
                Console Log Mutated
              </p>
              <p className="text-[8px] text-stone-500 lowercase leading-relaxed max-w-[200px] mx-auto">
                terminal transcripts have been suppressed on small screens to conserve combat layouts.
              </p>
            </div>
          ) : (
            logs.map((log, index) => {
              const isWinnerLabel = log.includes('WINS!');
              const isDrawLabel = log.includes('DRAW!');
              const isWarning = log.includes('⚠️');
              const isTurnHeader = log.includes('TURN 🔹');
              const isTurnPrompt = log.includes('place your mark:');

              let colorClass = 'text-stone-400';
              if (isWinnerLabel) {
                colorClass = 'text-yellow-300 font-black tracking-widest text-[10px] border border-yellow-500/20 p-1 bg-yellow-500/5 text-center animate-pulse block my-1';
              } else if (isDrawLabel) {
                colorClass = 'text-sky-300 font-extrabold pb-0.5 border-b border-dashed border-sky-950 block text-center uppercase tracking-wide my-1';
              } else if (isWarning) {
                colorClass = 'text-red-400 font-bold bg-red-950/15 p-1 rounded border border-red-950/40 my-1';
              } else if (isTurnHeader) {
                colorClass = 'text-amber-400 font-extrabold tracking-widest text-[9px] uppercase mt-2 border-t border-[#1f1711] pt-1.5';
              } else if (isTurnPrompt) {
                colorClass = 'text-stone-500 italic';
              } else if (log.startsWith('>')) {
                colorClass = 'text-emerald-400 font-bold';
              } else if (log.startsWith('==================================================')) {
                colorClass = 'text-stone-700 leading-none';
              }

              return (
                <div key={index} className={`whitespace-pre-wrap ${colorClass}`}>
                  {log}
                </div>
              );
            })
          )}
        </div>

        {/* INPUT DECK */}
        <div className="space-y-2 mt-auto">
          {/* Action Row */}
          <div className="flex gap-2">
            <button
              onClick={handleRestart}
              className="flex-1 py-1.5 bg-[#cca43b]/15 hover:bg-[#cca43b]/25 text-[#cca43b] hover:text-white border border-[#cca43b]/25 hover:border-[#cca43b] rounded transition-all text-[9px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <RotateCcw className="w-3 h-3" />
              Reboot Game
            </button>
          </div>

          {/* Interactive Shell Input bar */}
          <form onSubmit={handleTerminalSubmit} className="flex border border-stone-850 focus-within:border-[#cca43b]/60 bg-black rounded overflow-hidden select-none">
            <span className="pl-2.5 flex items-center justify-center text-[#cca43b] font-bold text-xs">
              &gt;
            </span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Enter number coordinate (1-9)..."
              className="w-full bg-transparent border-0 outline-0 focus:ring-0 text-[10px] text-stone-200 pl-1.5 py-1.5 font-mono lowercase"
              disabled={!!winner}
            />
            <button 
              type="submit"
              disabled={!!winner}
              className="bg-[#1c140e] hover:bg-[#2e2115] disabled:opacity-40 font-mono text-[9px] uppercase font-bold text-[#cca43b] px-3.5 border-l border-stone-900 transition-colors cursor-pointer"
            >
              Enter
            </button>
          </form>

          {/* Retreat button to draw canvas */}
          <button
            type="button"
            onClick={() => {
              if (confirm("Forfeit active campaign and return to design drafts?")) {
                setTictactoeActive(false);
              }
            }}
            className="w-full py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-white border border-red-900/30 text-[9px] uppercase tracking-wider rounded transition-colors font-bold cursor-pointer"
          >
            Retreat to draw board
          </button>
        </div>

      </div>

    </div>
  );
};
