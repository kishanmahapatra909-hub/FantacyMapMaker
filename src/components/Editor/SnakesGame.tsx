import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  User, 
  Dice5, 
  ArrowUpRight, 
  TrendingUp, 
  Skull, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Crown,
  ChevronRight,
  HelpCircle,
  HelpCircleIcon,
  Star,
  Maximize,
  Minimize
} from 'lucide-react';

type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

interface ActivePlayer {
  color: PlayerColor;
  position: number;
}

interface Snake {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  head: number;
  tail: number;
  originalHead: number;
  originalTail: number;
}

const INITIAL_SNAKES: Snake[] = [
  { id: 'A', head: 17, tail: 10, originalHead: 17, originalTail: 10 },
  { id: 'B', head: 54, tail: 34, originalHead: 54, originalTail: 34 },
  { id: 'C', head: 62, tail: 19, originalHead: 62, originalTail: 19 },
  { id: 'D', head: 87, tail: 24, originalHead: 87, originalTail: 24 },
  { id: 'E', head: 98, tail: 78, originalHead: 98, originalTail: 78 },
];

const LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  28: 84,
  40: 59,
  51: 67,
  71: 91
};

// Simple visual map helper for alternative column curving
const getCellCoords = (cellNum: number): { r: number; c: number } => {
  const rowFromBottom = Math.floor((cellNum - 1) / 10);
  const r = 9 - rowFromBottom;
  const col = (cellNum - 1) % 10;
  const c = rowFromBottom % 2 === 0 ? col : 9 - col;
  return { r, c };
};

export const SnakesGame: React.FC = () => {
  const { config, selectedIds, setSelectedId, updateObject, setSnakesActive: setSnakesActiveGlobal, isFullScreen, toggleFullScreen } = useEditorStore();

  const handleArtifactMouseDown = (e: React.MouseEvent, obj: any, boardRect: DOMRect) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(obj.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = obj.x;
    const initialY = obj.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Convert delta pixels back to 1500x1000 coordinate space
      const deltaX_editor = (deltaX / boardRect.width) * 1500;
      const deltaY_editor = (deltaY / boardRect.height) * 1000;

      updateObject(obj.id, {
        x: Math.max(0, Math.min(1500 - (obj.width || 80), initialX + deltaX_editor)),
        y: Math.max(0, Math.min(1000 - (obj.height || 80), initialY + deltaY_editor))
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Sound configuration
  const [muted, setMuted] = useState<boolean>(false);
  
  // Game setup states
  const [setupMode, setSetupMode] = useState<boolean>(true);
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [chosenColors, setChosenColors] = useState<PlayerColor[]>([]);
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  
  // Gameplay states
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [snakes, setSnakes] = useState<Snake[]>(INITIAL_SNAKES);
  const [snakesActive, setSnakesActive] = useState<boolean>(true);
  const [viperStrike, setViperStrike] = useState<boolean>(false);
  const [lastDiceValue, setLastDiceValue] = useState<number | null>(null);
  const [lastBoardShiftValue, setLastBoardShiftValue] = useState<number | null>(null);
  const [shifterTitle, setShifterTitle] = useState<string>('Static Grid');
  
  // Log Terminal state
  const [logs, setLogs] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [isAnimatingRoll, setIsAnimatingRoll] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Layout coordination configuration scanner for responsive SVGs
  const [cellCenters, setCellCenters] = useState<Record<number, { x: number; y: number }>>({});
  const boardRef = useRef<HTMLDivElement>(null);

  const getCellColorClass = (cellNum: number): { bg: string; text: string; hex: string } => {
    // Setup the rows coloring sequence (loyally copied from the user's reference image)
    const colors = [
      // Row 1 (1-10)
      { val: 1, c: 'YELLOW' }, { val: 2, c: 'WHITE' }, { val: 3, c: 'RED' }, { val: 4, c: 'BLUE' }, { val: 5, c: 'GREEN' },
      { val: 6, c: 'YELLOW' }, { val: 7, c: 'WHITE' }, { val: 8, c: 'RED' }, { val: 9, c: 'BLUE' }, { val: 10, c: 'GREEN' },
      // Row 2 (11-20)
      { val: 11, c: 'RED' }, { val: 12, c: 'WHITE' }, { val: 13, c: 'YELLOW' }, { val: 14, c: 'GREEN' }, { val: 15, c: 'BLUE' },
      { val: 16, c: 'RED' }, { val: 17, c: 'WHITE' }, { val: 18, c: 'YELLOW' }, { val: 19, c: 'GREEN' }, { val: 20, c: 'BLUE' },
      // Row 3 (21-30)
      { val: 21, c: 'WHITE' }, { val: 22, c: 'RED' }, { val: 23, c: 'BLUE' }, { val: 24, c: 'GREEN' }, { val: 25, c: 'YELLOW' },
      { val: 26, c: 'WHITE' }, { val: 27, c: 'RED' }, { val: 28, c: 'BLUE' }, { val: 29, c: 'GREEN' }, { val: 30, c: 'YELLOW' },
      // Row 4 (31-40)
      { val: 31, c: 'BLUE' }, { val: 32, c: 'RED' }, { val: 33, c: 'WHITE' }, { val: 34, c: 'YELLOW' }, { val: 35, c: 'GREEN' },
      { val: 36, c: 'BLUE' }, { val: 37, c: 'RED' }, { val: 38, c: 'WHITE' }, { val: 39, c: 'YELLOW' }, { val: 40, c: 'GREEN' },
      // Row 5 (41-50)
      { val: 41, c: 'RED' }, { val: 42, c: 'BLUE' }, { val: 43, c: 'GREEN' }, { val: 44, c: 'YELLOW' }, { val: 45, c: 'WHITE' },
      { val: 46, c: 'RED' }, { val: 47, c: 'BLUE' }, { val: 48, c: 'GREEN' }, { val: 49, c: 'YELLOW' }, { val: 50, c: 'WHITE' },
      // Row 6 (51-60)
      { val: 51, c: 'GREEN' }, { val: 52, c: 'BLUE' }, { val: 53, c: 'RED' }, { val: 54, c: 'WHITE' }, { val: 55, c: 'YELLOW' },
      { val: 56, c: 'GREEN' }, { val: 57, c: 'BLUE' }, { val: 58, c: 'RED' }, { val: 59, c: 'WHITE' }, { val: 60, c: 'YELLOW' },
      // Row 7 (61-70)
      { val: 61, c: 'BLUE' }, { val: 62, c: 'GREEN' }, { val: 63, c: 'YELLOW' }, { val: 64, c: 'WHITE' }, { val: 65, c: 'RED' },
      { val: 66, c: 'BLUE' }, { val: 67, c: 'GREEN' }, { val: 68, c: 'YELLOW' }, { val: 69, c: 'WHITE' }, { val: 70, c: 'RED' },
      // Row 8 (71-80)
      { val: 71, c: 'YELLOW' }, { val: 72, c: 'GREEN' }, { val: 73, c: 'BLUE' }, { val: 74, c: 'RED' }, { val: 75, c: 'WHITE' },
      { val: 76, c: 'YELLOW' }, { val: 77, c: 'GREEN' }, { val: 78, c: 'BLUE' }, { val: 79, c: 'RED' }, { val: 80, c: 'WHITE' },
      // Row 9 (81-90)
      { val: 81, c: 'GREEN' }, { val: 82, c: 'YELLOW' }, { val: 83, c: 'WHITE' }, { val: 84, c: 'RED' }, { val: 85, c: 'BLUE' },
      { val: 86, c: 'GREEN' }, { val: 87, c: 'YELLOW' }, { val: 88, c: 'WHITE' }, { val: 89, c: 'RED' }, { val: 90, c: 'BLUE' },
      // Row 10 (91-100)
      { val: 91, c: 'WHITE' }, { val: 92, c: 'YELLOW' }, { val: 93, c: 'GREEN' }, { val: 94, c: 'BLUE' }, { val: 95, c: 'RED' },
      { val: 96, c: 'WHITE' }, { val: 97, c: 'YELLOW' }, { val: 98, c: 'GREEN' }, { val: 99, c: 'WHITE' }, { val: 100, c: 'RED' }
    ];

    const match = colors.find(item => item.val === cellNum);
    const colorName = match ? match.c : 'WHITE';

    switch (colorName) {
      case 'YELLOW':
        return { bg: 'bg-[#fff200] border-black text-[#000000]', text: 'text-stone-950', hex: '#fff200' };
      case 'RED':
        return { bg: 'bg-[#ec1c24] border-black text-[#ffffff]', text: 'text-stone-950', hex: '#ec1c24' };
      case 'GREEN':
        return { bg: 'bg-[#00a859] border-black text-[#ffffff]', text: 'text-stone-950', hex: '#00a859' };
      case 'BLUE':
        return { bg: 'bg-[#0054a6] border-black text-[#ffffff]', text: 'text-stone-950', hex: '#0054a6' };
      case 'WHITE':
      default:
        return { bg: 'bg-[#ffffff] border-black text-[#000000]', text: 'text-stone-950', hex: '#ffffff' };
    }
  };

  const updateCellCenters = () => {
    if (!boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const centers: Record<number, { x: number; y: number }> = {};
    
    for (let i = 1; i <= 100; i++) {
      const el = document.getElementById(`cell-${i}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        centers[i] = {
          x: rect.left - boardRect.left + rect.width / 2,
          y: rect.top - boardRect.top + rect.height / 2
        };
      }
    }
    setCellCenters(centers);
  };

  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    // Scan initially
    updateCellCenters();

    const observer = new ResizeObserver(() => {
      updateCellCenters();
    });
    observer.observe(board);

    // Initial timeout sequences to guarantee complete layouts are detected
    const t1 = setTimeout(updateCellCenters, 100);
    const t2 = setTimeout(updateCellCenters, 400);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [players, setupMode, snakes]);

  const getSnakePath = (pHead: { x: number; y: number }, pTail: { x: number; y: number }, id: string) => {
    const dx = pTail.x - pHead.x;
    const dy = pTail.y - pHead.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return '';

    const nx = -dy / len;
    const ny = dx / len;

    const points = [];
    const numSteps = 10;
    
    // Custom wavy offsets depending on id to differentiate wiggliness
    const amplitude = Math.min(24, len * 0.14);
    const freq = id === 'A' || id === 'C' ? 1.4 : id === 'B' ? 2 : 1.7;

    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const baseX = pHead.x + dx * t;
      const baseY = pHead.y + dy * t;
      
      const offset = Math.sin(t * Math.PI * freq) * amplitude;
      
      points.push({
        x: baseX + nx * offset,
        y: baseY + ny * offset
      });
    }

    let d = `M ${pHead.x} ${pHead.y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const renderLaddersSVG = () => {
    return Object.entries(LADDERS).map(([startStr, end]) => {
      const start = parseInt(startStr);
      const p1 = cellCenters[start];
      const p2 = cellCenters[end];
      if (!p1 || !p2) return null;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) return null;

      const px = (-dy / len) * 7; 
      const py = (dx / len) * 7;

      const numRungs = Math.max(3, Math.floor(len / 16));
      const rungs = [];
      for (let i = 1; i < numRungs; i++) {
        const t = i / numRungs;
        const rx = p1.x + dx * t;
        const ry = p1.y + dy * t;
        rungs.push(
          <line
            key={i}
            x1={rx - px}
            y1={ry - py}
            x2={rx + px}
            y2={ry + py}
            stroke="#000000"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );
      }

      return (
        <g key={`ladder-${start}-${end}`} className="opacity-95 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {/* Side rail 1 outline */}
          <line
            x1={p1.x - px}
            y1={p1.y - py}
            x2={p2.x - px}
            y2={p2.y - py}
            stroke="#1a0f00"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Side rail 2 outline */}
          <line
            x1={p1.x + px}
            y1={p1.y + py}
            x2={p2.x + px}
            y2={p2.y + py}
            stroke="#1a0f00"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Side rail 1 fill */}
          <line
            x1={p1.x - px}
            y1={p1.y - py}
            x2={p2.x - px}
            y2={p2.y - py}
            stroke="#111111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Side rail 2 fill */}
          <line
            x1={p1.x + px}
            y1={p1.y + py}
            x2={p2.x + px}
            y2={p2.y + py}
            stroke="#111111"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Rungs */}
          {rungs}
        </g>
      );
    });
  };

  const renderSnakesSVG = () => {
    return snakes.map(s => {
      const pHead = cellCenters[s.head];
      const pTail = cellCenters[s.tail];
      if (!pHead || !pTail) return null;

      const pathD = getSnakePath(pHead, pTail, s.id);
      
      const colors = {
        A: { body: '#00a859', skin: '#fff200' }, 
        B: { body: '#ec1c24', skin: '#ffffff' }, 
        C: { body: '#91278f', skin: '#ff8a00' }, 
        D: { body: '#ff8a00', skin: '#fff200' }, 
        E: { body: '#0284c7', skin: '#ffffff' }  
      }[s.id] || { body: '#00a859', skin: '#fff200' };

      // Calculate vector from Head to determine direction of red slithering tongue
      const dx = pTail.x - pHead.x;
      const dy = pTail.y - pHead.y;
      const angle = Math.atan2(dy, dx);
      const tongueEndX = pHead.x - Math.cos(angle) * 11;
      const tongueEndY = pHead.y - Math.sin(angle) * 11;

      return (
        <g key={`snake-obj-${s.id}`} className="transition-all duration-300 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
          {/* Shadow layer */}
          <path
            d={pathD}
            fill="none"
            stroke="#000000"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-25"
          />
          {/* Solid snake scales backing */}
          <path
            d={pathD}
            fill="none"
            stroke={colors.body}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Detailed scale warnings overlay */}
          <path
            d={pathD}
            fill="none"
            stroke={colors.skin}
            strokeWidth="4"
            strokeDasharray="4,6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Tongue */}
          <line
            x1={pHead.x}
            y1={pHead.y}
            x2={tongueEndX}
            y2={tongueEndY}
            stroke="#ec1c24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Snake head bulb */}
          <circle
            cx={pHead.x}
            cy={pHead.y}
            r="7"
            fill={colors.body}
            stroke="#000000"
            strokeWidth="1.5"
          />
          {/* Eyes */}
          <circle cx={pHead.x - 2} cy={pHead.y - 1} r="1.8" fill="#ffffff" />
          <circle cx={pHead.x - 2} cy={pHead.y - 1} r="0.8" fill="#000000" />
          <circle cx={pHead.x + 2} cy={pHead.y - 1} r="1.8" fill="#ffffff" />
          <circle cx={pHead.x + 2} cy={pHead.y - 1} r="0.8" fill="#000000" />
          
          {/* Tail pointy bulb */}
          <circle
            cx={pTail.x}
            cy={pTail.y}
            r="3"
            fill={colors.body}
            stroke="#000000"
            strokeWidth="1.2"
          />
        </g>
      );
    });
  };

  // Play a simple synthesizer note
  const playSound = (type: 'roll' | 'climb' | 'snake' | 'shift' | 'win' | 'setup') => {
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
      
      if (type === 'roll') {
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'climb') {
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'snake') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'shift') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === 'setup') {
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio synthesis failed to initialize:', e);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  // Setup game at mount & load saved layout/progress or show greetings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fantasy_snakes_game_state_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.players && parsed.players.length > 0) {
          setSetupMode(parsed.setupMode !== undefined ? parsed.setupMode : false);
          setPlayerCount(parsed.playerCount || 2);
          setChosenColors(parsed.chosenColors || []);
          setPlayers(parsed.players);
          setCurrentPlayerIdx(parsed.currentPlayerIdx !== undefined ? parsed.currentPlayerIdx : 0);
          setConsecutiveSixes(parsed.consecutiveSixes !== undefined ? parsed.consecutiveSixes : 0);
          setSnakes(parsed.snakes || INITIAL_SNAKES);
          setSnakesActive(parsed.snakesActive !== undefined ? parsed.snakesActive : true);
          setViperStrike(parsed.viperStrike !== undefined ? parsed.viperStrike : false);
          setShifterTitle(parsed.shifterTitle || 'Static Grid');
          setLogs(parsed.logs || []);
          setWinner(parsed.winner || null);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load Snakes game progress:", err);
    }

    setLogs([
      '==================================================',
      '🐍 WELCOME TO THE DYNAMIC SNAKES & LADDERS ENGINE! 🐍',
      '==================================================',
      'SYSTEM: Managing a local human-only workspace campaign.',
      'GAME CONSTRAINT: Support for 1 to 4 active guilds.',
      'PROMPT: Enter player count below to begin guild allocation.',
      '=================================================='
    ]);
    playSound('setup');
  }, []);

  // Save progress dynamically when states modify
  useEffect(() => {
    if (players && players.length > 0) {
      try {
        localStorage.setItem('fantasy_snakes_game_state_v2', JSON.stringify({
          setupMode,
          playerCount,
          chosenColors,
          players,
          currentPlayerIdx,
          consecutiveSixes,
          snakes,
          snakesActive,
          viperStrike,
          shifterTitle,
          logs,
          winner
        }));
      } catch (err) {
        console.error("Failed to save Snakes game progress:", err);
      }
    }
  }, [setupMode, playerCount, chosenColors, players, currentPlayerIdx, consecutiveSixes, snakes, snakesActive, viperStrike, shifterTitle, logs, winner]);

  // Sync scroll to bottom of log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      // Safeguard delay to capture continuous appending updates
      const timer = setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [logs]);

  // Window resize effect for mobile and tablet detection matching screens (< 1024px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle setting player counts
  const handlePlayerCountConfirm = (count: number) => {
    setPlayerCount(count);
    addLog(`SYSTEM: Confirmed ${count} human player tracks. Choosing unique faction colors...`);
    playSound('setup');
  };

  // Allocate color
  const selectColor = (color: PlayerColor) => {
    if (chosenColors.includes(color)) return;
    const nextColors = [...chosenColors, color];
    setChosenColors(nextColors);
    addLog(`GUILD REGISTER: Player ${nextColors.length} claimed [${color}] tokens.`);
    playSound('setup');

    // Complete setup automatically if all players picked unique colors
    if (nextColors.length === playerCount) {
      const initialPlayerObjects: ActivePlayer[] = nextColors.map(col => ({
        color: col,
        position: 0,
      }));
      setPlayers(initialPlayerObjects);
      setSetupMode(false);
      setCurrentPlayerIdx(0);
      setConsecutiveSixes(0);
      setLogs([]);
      
      setLogs([
        '==================================================',
        '🏰 CAMPAIGN INITIALIZED: RECOGNIZED FACTION ROSTER:',
        ...nextColors.map((c, i) => ` Faction ${i + 1}: 🛡️ ${c} Guild (Position 0)`),
        '==================================================',
        '🎮 MAIN GAME INITIALISED. Snakes are currently ACTIVE.',
        '🛠️ ROLL THE DICE to advance!',
        '==================================================',
        `🔴 ROUND 1: Turn belongs to [${nextColors[0]}] Guild.`
      ]);
      playSound('win');
    }
  };

  const calculateTargetPosition = (curr: number, roll: number): number => {
    const target = curr + roll;
    if (target <= 100) return target;
    const overflow = target - 100;
    return 100 - overflow; // Bounce rule
  };

  const resetAll = () => {
    localStorage.removeItem('fantasy_snakes_game_state_v2');
    setSetupMode(true);
    setChosenColors([]);
    setPlayers([]);
    setWinner(null);
    setLastDiceValue(null);
    setLastBoardShiftValue(null);
    setSnakes(INITIAL_SNAKES);
    setSnakesActive(true);
    setViperStrike(false);
    setShifterTitle('Static Grid');
    setLogs([
      '==================================================',
      '🐍 DYNAMIC SNAKES & LADDERS INITIALIZATION ENGINE',
      '==================================================',
      'SYSTEM: State cleared.',
      'PROMPT: Select player count below (1-4).'
    ]);
    playSound('setup');
  };

  // Roll game turn
  const rollGameDice = () => {
    if (winner || setupMode || isAnimatingRoll) return;

    setIsAnimatingRoll(true);
    playSound('roll');
    
    // Simulate dice rolling visual stagger
    setTimeout(() => {
      setIsAnimatingRoll(false);
      
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastDiceValue(roll);
      
      const activePlayer = players[currentPlayerIdx];
      const col = activePlayer.color;
      
      addLog(`🎲 [${col}] rolled a [${roll}]!`);

      // Consecutive Sixes Rule
      let nextConsecutive = consecutiveSixes;
      if (roll === 6) {
        nextConsecutive += 1;
      } else {
        nextConsecutive = 0;
      }
      setConsecutiveSixes(nextConsecutive);

      if (nextConsecutive === 3) {
        addLog(`⚠️ PANIC! 3 consecutive sixes in a row. Turn cancelled and passed to next player.`);
        setConsecutiveSixes(0);
        advanceTurn(players, false); // Turn passes, no movements
        return;
      }

      // Calculate path with bounce on overflow
      const currentPos = activePlayer.position;
      let targetPos = calculateTargetPosition(currentPos, roll);
      
      if (currentPos === 0 && roll !== 6) {
        addLog(`🛡️ [${col}] must roll a 6 to enter the board! Current Position remains 0.`);
        advanceTurn(players, roll === 6);
        return;
      }

      const logLines: string[] = [];
      let movementLog = `🐎 [${col}] advances from ${currentPos} ➔ ${targetPos}`;
      if (currentPos === 0 && roll === 6) {
        movementLog = `🚀 [${col}] deploys onto the battlefield at cell 6!`;
        targetPos = 6;
      } else if (currentPos + roll > 100) {
        movementLog = `💥 Over-rolled! [${col}] bounces back from 100 ➔ ending on ${targetPos}`;
      }
      logLines.push(movementLog);

      // Solve Board Elements
      let finalPos = targetPos;
      
      // 1. Check Ladders (Fixed)
      if (LADDERS[finalPos]) {
        const dest = LADDERS[finalPos];
        logLines.push(`🪜 ASCENSION! Found a Mystical Gilded Ladder: climbing ${finalPos} ➔ ${dest}!`);
        finalPos = dest;
        setTimeout(() => playSound('climb'), 200);
      }

      // 2. Check Snakes (Dynamic Head checking)
      const metSnake = snakes.find(s => s.head === finalPos);
      if (metSnake) {
        const dest = metSnake.tail;
        if (viperStrike) {
          logLines.push(`🐍💀 VIPER STRIKE BITE! Falling down Snake ${metSnake.id} Head ${finalPos} ➔ Tail ${dest}!`);
        } else {
          logLines.push(`🐍 SNAKE BITE! Falling down Snake ${metSnake.id} Head ${finalPos} ➔ Tail ${dest}!`);
        }
        finalPos = dest;
        setTimeout(() => playSound('snake'), 200);
      }

      // Check Win Condition
      const won = finalPos === 100;

      // Update player array
      const nextPlayers = players.map((p, idx) => {
        if (idx === currentPlayerIdx) {
          return { ...p, position: finalPos };
        }
        return p;
      });
      setPlayers(nextPlayers);
      
      // Flush movement logs
      logLines.forEach(l => addLog(l));

      if (won) {
        setWinner(col);
        addLog(`🎉🏆👑 FACTION TRIUMPH! [${col}] Guild claims absolute glory at Cell 100!`);
        playSound('win');
        return;
      }

      // Advance Turn
      advanceTurn(nextPlayers, roll === 6);
    }, 500);
  };

  const advanceTurn = (currentPlayersList: ActivePlayer[], rolledSix: boolean) => {
    if (rolledSix) {
      addLog(`✨ BONUS ROUND: [${currentPlayersList[currentPlayerIdx].color}] rolled a 6 and earns an extra move!`);
      addLog(`👉 [${currentPlayersList[currentPlayerIdx].color}] is rolling inside bonus channel.`);
      return;
    }

    const nextPlayerIndex = (currentPlayerIdx + 1) % playerCount;
    setCurrentPlayerIdx(nextPlayerIndex);
    setConsecutiveSixes(0);

    // If turn index wrapped around, it signals a ROUND SHIFT END!
    if (nextPlayerIndex === 0) {
      triggerBoardShift(currentPlayersList);
    } else {
      addLog(`👉 Turn passes to [${currentPlayersList[nextPlayerIndex].color}] Guild.`);
    }
  };

  // Turn Board Shifting Engine
  const triggerBoardShift = (currentPlayersList: ActivePlayer[]) => {
    addLog('==================================================');
    addLog('🚨 ROUND COMPLETE. ENGAGING BOARD SHIFT SYSTEM...');
    playSound('shift');

    const shiftDice = Math.floor(Math.random() * 6) + 1;
    setLastBoardShiftValue(shiftDice);

    // Default flags before updates
    let nextSnakesActive = true;
    let nextViperStrike = false;
    let nextSnakes = [...snakes];
    let titleStr = '';

    switch (shiftDice) {
      case 1:
      case 2:
        nextSnakesActive = true;
        titleStr = `All Snakes Alert (Roll ${shiftDice})`;
        addLog(`🐍 SHAPE SHIFT [SNAKES ALERT]: All snakes are fully alert and ready to bite! Landing on any snake head drops players to its tail.`);
        break;
      
      case 3:
        titleStr = `Slither Forward (Roll 3)`;
        addLog(`⏩ SHAPE SHIFT [SLITHER FORWARD]: Snake head B and snake head D slither 2 tiles forward!`);
        nextSnakes = snakes.map(s => {
          if (s.id === 'B' || s.id === 'D') {
            const nextHead = Math.min(99, s.head + 2);
            if (nextHead !== s.head) {
              addLog(`  • Snake ${s.id} Head advanced: ${s.head} ➔ ${nextHead}`);
            }
            return { ...s, head: nextHead };
          }
          return s;
        });
        break;

      case 4:
        titleStr = `Slither Backward (Roll 4)`;
        addLog(`⏪ SHAPE SHIFT [SLITHER BACKWARD]: Snake head C and snake head E retreat 3 tiles backward!`);
        nextSnakes = snakes.map(s => {
          if (s.id === 'C' || s.id === 'E') {
            const nextHead = Math.max(s.tail + 1, s.head - 3);
            if (nextHead !== s.head) {
              addLog(`  • Snake ${s.id} Head retreated: ${s.head} ➔ ${nextHead}`);
            }
            return { ...s, head: nextHead };
          }
          return s;
        });
        break;

      case 5:
        titleStr = `Tail Strike (Roll 5)`;
        addLog(`🔥 SHAPE SHIFT [TAIL STRIKE]: All snake tails move 2 tiles closer to their heads (penalties shortened)!`);
        nextSnakes = snakes.map(s => {
          const nextTail = Math.min(s.head - 1, s.tail + 2);
          if (nextTail !== s.tail) {
            addLog(`  • Snake ${s.id} Tail shortened: ${s.tail} ➔ ${nextTail}`);
          }
          return { ...s, tail: nextTail };
        });
        break;

      case 6:
        nextViperStrike = true;
        titleStr = `Viper Strike (Roll 6)`;
        addLog(`💀 SHAPE SHIFT [VIPER STRIKE]: Snakes become venomous! Landing on snake heads drops players directly back to their tail!`);
        break;
    }

    setSnakes(nextSnakes);
    setSnakesActive(nextSnakesActive);
    setViperStrike(nextViperStrike);
    setShifterTitle(titleStr);

    // Print Visual State Refresh as required exactly
    addLog('==================================================');
    addLog(`🔄 CURRENT SNAKE LAYOUT: ${nextSnakes.map(s => `(${s.id}: head ${s.head} ➔ tail ${s.tail})`).join(', ')}`);
    addLog('==================================================');
    addLog('STATUS:');
    currentPlayersList.forEach(p => {
      addLog(`🛡️ ${p.color}: Square ${p.position}`);
    });
    addLog('==================================================');
    
    // Prompt next player
    addLog(`👉 ROUND BEGINS: Turn belongs to [${currentPlayersList[0].color}] Guild.`);
  };

  // Keyboard console execution
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    setTerminalInput('');

    if (!command) return;

    if (command === 'roll' || command === 'r') {
      if (winner) {
        addLog('SYSTEM ERROR: Campaign is complete. Type "reset" to configure a new battle.');
      } else {
        rollGameDice();
      }
    } else if (command === 'reset') {
      resetAll();
    } else if (command === 'help') {
      addLog('AVAILABLE LAUNCH CODES:');
      addLog('  "roll" or "r" - Executes a turn roll.');
      addLog('  "reset" - Resets the Snakes map setup.');
      addLog('  "help" - Reveals developer notes.');
    } else {
      addLog(`CONSOLE ERROR: Command [${command}] not recognized. Enter "roll" or "reset"`);
    }
  };

  // Render nice overlays or tooltips about tiles
  const getCellDetailBadge = (cellNum: number) => {
    return null;
  };

  const getCellBackground = (cellNum: number) => {
    return getCellColorClass(cellNum).bg;
  };

  return (
    <div className="flex flex-col xl:flex-row w-full max-w-7xl mx-auto gap-5 p-3 bg-[#0a0807] rounded-xl border border-[#2b221a] text-stone-300 font-sans shadow-2xl relative xl:h-[652px] items-stretch overflow-hidden">
      
      {/* Sound Controller Float */}
      <button 
        onClick={() => setMuted(!muted)}
        className="absolute top-4 right-4 p-2 bg-stone-900/95 hover:bg-stone-800 border border-[#3e3226] text-stone-400 rounded-full z-30 transition-colors"
      >
        {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
      </button>

      {/* SETUP CONFIGURATION WIZARD OVERLAY */}
      <AnimatePresence>
        {setupMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0c0908]/98 flex items-center justify-center p-6 z-40 backdrop-blur-md"
          >
            <div className="max-w-md w-full bg-[#161210] border-2 border-emerald-500/30 rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
              <div className="flex flex-col items-center">
                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 animate-pulse">
                  <Dice5 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="font-fantasy text-xl font-bold uppercase tracking-widest text-emerald-400">
                  Snakes &amp; Ladders Guild House
                </h2>
                <div className="flex gap-1 items-center justify-center mt-1">
                  <span className="h-[2px] w-8 bg-emerald-500/30" />
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black font-mono">Dynamic Shifter Engine</p>
                  <span className="h-[2px] w-8 bg-emerald-500/30" />
                </div>
              </div>

              {/* Step 1: Human Player size Selector */}
              <div className="space-y-3">
                <p className="text-xs text-stone-300 leading-relaxed font-mono">
                  &ldquo;Begin immediately by welcoming the players. State that the game limit is 1 to 4 players, and ask how many are playing today so they can begin selecting their colors.&rdquo;
                </p>
                
                <div className="bg-stone-950/40 p-3 rounded-lg border border-stone-800 flex flex-col justify-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#caa372] font-extrabold block">How many players are playing today?</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => handlePlayerCountConfirm(num)}
                        className={`py-2 rounded border font-mono font-bold text-sm transition-all ${
                          playerCount === num 
                            ? 'bg-emerald-500 text-stone-950 border-emerald-500 font-extrabold shadow-md scale-105' 
                            : 'bg-stone-900 border-stone-800 hover:border-[#caa372]/50 text-stone-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Faction Color selections */}
              {playerCount > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    <span>Faction Selector ({chosenColors.length} of {playerCount}):</span>
                    <span>Waiting...</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).map(c => {
                      const isTaken = chosenColors.includes(c);
                      const styles = {
                        RED: 'bg-red-500/10 hover:bg-red-500/25 text-red-500 border-red-500/30',
                        GREEN: 'bg-green-500/10 hover:bg-green-500/25 text-green-500 border-green-500/30',
                        YELLOW: 'bg-amber-500/10 hover:bg-amber-500/25 text-amber-500 border-amber-500/30',
                        BLUE: 'bg-blue-500/10 hover:bg-blue-500/25 text-blue-500 border-blue-500/30'
                      }[c];

                      return (
                        <button
                          key={c}
                          disabled={isTaken}
                          onClick={() => selectColor(c)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold font-mono tracking-widest transition-all ${styles} ${
                            isTaken ? 'opacity-30 cursor-not-allowed scale-95 border-dashed border-stone-900' : 'hover:scale-103'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            c === 'RED' ? 'bg-red-500' : c === 'GREEN' ? 'bg-green-500' : c === 'YELLOW' ? 'bg-amber-400' : 'bg-blue-500'
                          }`} />
                          {c} {isTaken ? '(TAKEN)' : '(CHOOSE)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold font-mono border-t border-stone-900 pt-3">
                ⚠️ Local Offline Multiplayer Module
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: VISUAL BOARD */}
      <div className="flex-1 flex flex-col justify-start space-y-3 p-1">
        
        {/* Header Ribbon bar */}
        <div className="hidden md:flex items-center justify-between bg-[#15110f]/80 p-3 rounded-lg border border-[#30261e]">
          <div className="space-y-0.5">
            <h1 className="font-fantasy text-sm font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" /> Faction Battlegrounds
            </h1>
            <p className="text-[9px] text-stone-500 uppercase tracking-wide font-mono">
              Mode: <span className="text-stone-300 font-bold">{shifterTitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {isMobile && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Forfeit active campaign and return to design drafts?")) {
                    setSnakesActiveGlobal(false);
                  }
                }}
                className="px-2 py-1 bg-red-950/40 hover:bg-red-950/60 border border-red-900/40 text-red-400 rounded text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer mr-1"
              >
                Exit Game
              </button>
            )}

            {/* Status indicators of quick rules */}
            <div className={`px-2 py-1 rounded text-[8px] font-bold uppercase border flex items-center gap-1 tracking-wider bg-emerald-900/10 text-emerald-400 border-emerald-950`}>
              <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
              Snakes: Active
            </div>

            {!isMobile && (
              <button
                type="button"
                onClick={toggleFullScreen}
                className={`px-2.5 py-1 rounded text-[8px] font-bold uppercase border flex items-center gap-1.5 tracking-wider font-mono cursor-pointer transition-colors ${
                  isFullScreen 
                    ? "text-fantasy-gold border-[#524430] bg-[#1c1611] shadow-[0_0_8px_rgba(212,175,55,0.2)] animate-pulse"
                    : "bg-stone-900 border-[#30261e] text-stone-300 hover:text-white hover:bg-stone-850"
                }`}
                title={isFullScreen ? "Exit Full Screen" : "Board Full Screen"}
              >
                {isFullScreen ? <Minimize className="w-2.5 h-2.5 text-fantasy-gold" /> : <Maximize className="w-2.5 h-2.5 text-[#e0d8c3]" />}
                <span>{isFullScreen ? "Minimize" : "Full Screen"}</span>
              </button>
            )}

            {viperStrike && (
              <span className="px-2 py-1 rounded text-[8px] font-bold uppercase bg-red-950 text-red-400 border border-red-900 flex items-center gap-1 tracking-widest">
                <Skull className="w-2.5 h-2.5 animate-bounce" /> VIPER STRIKE ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Board Visual Canvas */}
        <div 
          ref={boardRef}
          id="snakes-board-container"
          className="relative w-full aspect-square max-w-[280px] min-[360px]:max-w-[325px] min-[400px]:max-w-[365px] sm:max-w-[450px] md:max-w-[500px] xl:max-w-[550px] mx-auto bg-white border-4 border-black rounded shadow-[#000000]/65 shadow-2xl overflow-hidden flex flex-col justify-between"
        >
          {/* Main 10x10 Grid cells matching 100 squares */}
          <div className="grid grid-cols-10 grid-rows-10 w-full h-full gap-0 p-0 relative z-0 select-none">
            {Array.from({ length: 100 }).map((_, idx) => {
              const cellNum = 100 - idx;
              // Translate index to match layout number curving recursively
              // Cell indexes in UI: row starting at top, 0-indexed is squares 100-91
              // Let's compute actual cell values for coordinates:
              const rowIdx = Math.floor(idx / 10); // 0 at top to 9 at bottom
              const rowFromBottom = 9 - rowIdx;
              const colOffset = idx % 10;
              const displayedNumber = rowFromBottom % 2 === 0 
                ? (rowFromBottom * 10) + colOffset + 1
                : (rowFromBottom * 10) + (9 - colOffset) + 1;

              const bgClasses = getCellBackground(displayedNumber);
              const playersOnThisTile = players.filter(p => p.position === displayedNumber);

              return (
                <div
                  id={`cell-${displayedNumber}`}
                  key={displayedNumber}
                  className={`relative flex flex-col justify-between p-0.5 border border-[#000000] overflow-visible aspect-square transition-colors ${bgClasses}`}
                >
                  <span className="absolute top-0.5 left-1 font-sans font-extrabold text-[#000000] text-[11px] md:text-[15px] select-none leading-none drop-shadow-[0_1px_0px_rgba(255,255,255,0.75)] z-0">
                    {displayedNumber}
                  </span>

                  {/* Cell 100 Star Decoration */}
                  {displayedNumber === 100 && (
                    <div className="absolute inset-0 flex items-center justify-center p-2 z-0 opacity-80">
                      <Star className="w-5 h-5 md:w-8 md:h-8 text-[#fff200] fill-[#fff200] stroke-black stroke-2" />
                    </div>
                  )}

                  {/* Draw internal dynamic element detail label */}
                  {getCellDetailBadge(displayedNumber)}

                  {/* Render player tokens resting inside this tile */}
                  {playersOnThisTile.length > 0 && (
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5 z-25 w-full h-full">
                      {playersOnThisTile.map(p => {
                        const styleClasses = {
                          RED: 'bg-[#ec1c24] border-white text-white shadow-[#ec1c24]/50',
                          GREEN: 'bg-[#00a859] border-white text-white shadow-[#00a859]/50',
                          YELLOW: 'bg-[#fff200] border-black text-black shadow-[#fff200]/50',
                          BLUE: 'bg-[#0054a6] border-white text-white shadow-[#0054a6]/50'
                        }[p.color];

                        const isActive = players[currentPlayerIdx]?.color === p.color && !winner;

                        return (
                          <motion.div
                            key={p.color}
                            layoutId={`token-${p.color}`}
                            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                            className={`w-3.5 h-3.5 md:w-5 md:h-5 rounded-full flex items-center justify-center font-black font-sans text-[8px] md:text-[11px] border shadow-md ${styleClasses} ${
                              isActive ? 'ring-2 ring-black scale-110 z-30 animate-pulse' : ''
                            }`}
                          >
                            {p.color[0]}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic SVG snakes & ladders vector overlays */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {renderLaddersSVG()}
            {renderSnakesSVG()}
          </svg>
        </div>

        {/* MOBILE CONTROLS BOARD: Displays directly beneath the board on mobile screens instead of the bottom corner */}
        {isMobile && !setupMode && (
          <div className="bg-[#120f0e] rounded-lg p-2.5 border border-[#3e3126]/60 space-y-2 max-w-[280px] min-[360px]:max-w-[325px] min-[400px]:max-w-[365px] sm:max-w-[450px] md:max-w-[500px] mx-auto w-full">
            {winner ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-center text-[10px] font-mono text-yellow-500 space-y-1">
                <p className="font-bold">🎖️ VICTORY DECLARED! {winner} Guild Wins!</p>
                <button 
                  onClick={resetAll}
                  className="w-full py-1.5 bg-yellow-500 text-stone-950 font-black rounded uppercase text-[9px] tracking-wide"
                >
                  Launch New Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2 items-center justify-between">
                  {/* Current Active Player Info */}
                  <span className="text-[10px] font-mono text-stone-400 font-extrabold uppercase">
                    Current Turn: <span className="text-emerald-400 font-black">[{players[currentPlayerIdx]?.color || 'NONE'}]</span>
                  </span>
                  
                  {/* Last roll result indicator if exists */}
                  {lastDiceValue !== null && (
                    <span className="text-[9px] font-mono font-bold bg-[#1b1713] px-2 py-0.5 rounded border border-stone-800 text-yellow-400">
                      Last Roll: {lastDiceValue}
                    </span>
                  )}
                </div>

                <div className="flex gap-1.5 items-stretch">
                  {/* Interactive Roll Button */}
                  <button
                    id="btn-snakes-roll-mobile"
                    onClick={() => {
                      if (isAnimatingRoll) return;
                      rollGameDice();
                    }}
                    className={`flex-grow flex-shrink-0 flex-1 py-3 rounded font-black uppercase text-xs tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isAnimatingRoll 
                        ? 'bg-stone-850 text-stone-500 border-stone-800 opacity-70 pointer-events-none'
                        : {
                            RED: 'bg-[#e31b23] hover:bg-red-650 text-white border-red-500 shadow-red-950/40',
                            GREEN: 'bg-[#00a859] hover:bg-green-650 text-white border-green-500 shadow-green-950/40',
                            YELLOW: 'bg-[#fff200] hover:bg-yellow-450 text-stone-950 border-yellow-500 shadow-yellow-950/40',
                            BLUE: 'bg-[#0054a6] hover:bg-blue-650 text-white border-blue-500 shadow-blue-950/40'
                          }[players[currentPlayerIdx]?.color]
                    }`}
                  >
                    <Dice5 className={`w-4 h-4 ${isAnimatingRoll ? 'animate-spin' : ''}`} />
                    {isAnimatingRoll ? 'ROLLING...' : `ROLL [${players[currentPlayerIdx]?.color}]`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Position Zero - Outer Harbor starting yard */}
        {!isMobile && (
          <div className="bg-[#120f0e] rounded-lg p-3 border border-[#3e3126]/40 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                🚀 Off-Board Barracks (Cell 0)
              </h3>
              <p className="text-[8px] text-stone-500">Claim a &rdquo;6&rdquo; to deploy your guild token onto cellular grid.</p>
            </div>

            <div className="flex gap-1.5 bg-stone-950 px-3 py-1.5 rounded border border-[#2b221a]">
              {players.filter(p => p.position === 0).length === 0 ? (
                <span className="text-[9px] text-stone-600 font-mono tracking-widest uppercase italic block">All deployed</span>
              ) : (
                players.filter(p => p.position === 0).map(p => {
                  const styleColors = {
                    RED: 'bg-[#e31b23] border-white text-white',
                    GREEN: 'bg-[#00a859] border-white text-white',
                    YELLOW: 'bg-[#fff200] border-black text-black',
                    BLUE: 'bg-[#0054a6] border-white text-white'
                  }[p.color];

                  return (
                    <div
                      key={p.color}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center font-black font-mono text-[9px] shadow ${styleColors}`}
                      title={`${p.color} waiting`}
                    >
                      {p.color[0]}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: TERMINAL CONSOLE & LEDGER LOG */}
      {!isMobile && (
        <div className="w-full xl:w-[350px] flex flex-col justify-between gap-3 bg-[#0d0a09] border-t xl:border-t-0 xl:border-l border-[#2e231b] p-3 items-stretch xl:h-full overflow-hidden">
        
        {/* State Panel Header */}
        <div className="space-y-2">
          
          <div className="flex items-center justify-between border-b border-[#2e231b] pb-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#caa372] font-mono">Engine Terminal</span>
            </div>
            
            <button 
              onClick={resetAll}
              className="text-[8px] uppercase tracking-widest font-black text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-0.5"
              title="Reconfigure Lobby"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>

          {/* Faction Roster STATUS layout */}
          <div className="bg-stone-950/80 rounded border border-[#2d221a] p-2 space-y-1.5">
            <span className="text-[8px] uppercase tracking-widest text-stone-500 font-extrabold flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 text-amber-500" /> Player Statuses:
            </span>
            <div className="space-y-1">
              {players.map(p => {
                const isMyTurn = players[currentPlayerIdx]?.color === p.color && !winner;
                const progressWidth = `${p.position}%`;

                const textCol = {
                  RED: 'text-red-500',
                  GREEN: 'text-green-500',
                  YELLOW: 'text-amber-400',
                  BLUE: 'text-blue-400'
                }[p.color];

                return (
                  <div key={p.color} className={`p-1 rounded text-[10px] font-mono flex flex-col gap-0.5 ${isMyTurn ? 'bg-[#1b1713] border border-emerald-500/20' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-black flex items-center gap-1 ${textCol}`}>
                        {p.color === 'RED' && '🔴'}
                        {p.color === 'GREEN' && '🟢'}
                        {p.color === 'YELLOW' && '🟡'}
                        {p.color === 'BLUE' && '🔵'}
                        {p.color}:
                      </span>
                      <span className="text-stone-400 font-bold">Square {p.position}</span>
                    </div>
                    {/* Tiny visual progress bar */}
                    <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: progressWidth }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SCROLLABLE LOG BOX */}
        <div ref={logContainerRef} className="flex-1 min-h-[160px] h-[160px] xl:h-0 overflow-y-auto bg-black/90 rounded border border-stone-900 p-2.5 font-mono text-[9px] space-y-1 custom-scrollbar leading-relaxed">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`whitespace-pre-wrap ${
                log.includes('ASCENSION') ? 'text-yellow-400 font-bold' :
                log.includes('SNAKE BITE') ? 'text-red-400' :
                log.includes('SHAPE SHIFT') ? 'text-amber-400 font-extrabold bg-[#15110d] px-1 rounded border border-[#caa372]/30' :
                log.includes('TRIUMPH') ? 'text-yellow-300 font-black tracking-wide text-xs border border-yellow-500/30 p-1 bg-yellow-500/10 text-center animate-pulse' :
                log.startsWith('🎲') ? 'text-sky-300 font-bold' :
                log.startsWith('🔴') ? 'text-red-400 uppercase tracking-widest font-extrabold border-b border-[#2d221a] pb-0.5 mb-1' :
                log.startsWith('==================================================') ? 'text-stone-700 font-normal leading-none' :
                log.startsWith('STATUS:') ? 'text-[#caa372] font-semibold tracking-wider text-[8px] uppercase mb-0.5' :
                'text-stone-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>

        {/* COMMAND EXECUTIONS PANEL */}
        <div className="space-y-2 pt-1">
          {winner ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-center text-[10px] font-mono text-yellow-500 space-y-1">
              <p className="font-bold">🎖️ VICTORY DECLARED! {winner} Guild Wins!</p>
              <button 
                onClick={resetAll}
                className="w-full py-1.5 bg-yellow-500 text-stone-950 font-black rounded uppercase text-[9px] tracking-wide"
              >
                Launch New Campaign
              </button>
            </div>
          ) : !setupMode ? (
            <div className="space-y-2">
              {!isMobile && (
                <div className="flex gap-1.5 items-stretch">
                  {/* Visual Roll button */}
                  <button
                    id="btn-snakes-roll"
                    onClick={() => {
                      if (isAnimatingRoll) return;
                      rollGameDice();
                    }}
                    className={`flex-grow flex-shrink-0 flex-1 py-3 rounded font-black uppercase text-xs tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isAnimatingRoll 
                        ? 'bg-stone-850 text-stone-500 border-stone-800 opacity-70 pointer-events-none'
                        : {
                            RED: 'bg-[#e31b23] hover:bg-red-650 text-white border-red-500 shadow-red-950/40',
                            GREEN: 'bg-[#00a859] hover:bg-green-650 text-white border-green-500 shadow-green-950/40',
                            YELLOW: 'bg-[#fff200] hover:bg-yellow-450 text-stone-950 border-yellow-500 shadow-yellow-950/40',
                            BLUE: 'bg-[#0054a6] hover:bg-blue-650 text-white border-blue-500 shadow-blue-950/40'
                          }[players[currentPlayerIdx]?.color]
                    }`}
                  >
                    <Dice5 className={`w-4 h-4 ${isAnimatingRoll ? 'animate-spin' : ''}`} />
                    {isAnimatingRoll ? 'ROLLING...' : `ROLL [${players[currentPlayerIdx]?.color}]`}
                  </button>
                </div>
              )}

              {/* Core Terminal Command Bar */}
              <form onSubmit={handleTerminalSubmit} className="flex border border-stone-800 focus-within:border-[#caa372]/60 bg-black rounded overflow-hidden">
                <span className="pl-2.5 flex items-center justify-center text-stone-500 font-bold text-xs select-none">
                  &gt;
                </span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder='Type "roll" or drag/click'
                  className="w-full bg-transparent border-0 outline-0 focus:ring-0 text-[10px] text-stone-200 pl-1.5 py-1.5 font-mono lowercase"
                />
                <button 
                  type="submit"
                  className="bg-[#1b1713] hover:bg-[#31271f] font-mono text-[9px] uppercase font-bold text-[#caa372] px-2.5 border-l border-stone-800 transition-colors"
                >
                  Enter
                </button>
              </form>

              {/* Retreat Button to exit back to normal canvas draft */}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Forfeit active campaign and return to design drafts?")) {
                    setSnakesActiveGlobal(false);
                  }
                }}
                className="w-full mt-1.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-white border border-red-900/30 text-[9px] uppercase tracking-wider rounded transition-colors font-bold cursor-pointer"
              >
                Retreat to draw board
              </button>
            </div>
          ) : (
            <div className="bg-stone-950/80 p-2 border border-[#2d221a] rounded text-[9px] font-mono text-stone-500 text-center uppercase">
              Configure players to fire gameplay controls
            </div>
          )}
        </div>
      </div>
    )}

    </div>
  );
};
