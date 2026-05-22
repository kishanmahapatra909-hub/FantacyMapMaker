import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dices, RotateCcw, Shield, X, Swords, Trophy, Sparkles, 
  ChevronRight, Compass, Crown, AlertTriangle
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';

export type LudoColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export interface LudoToken {
  id: number; // 0 to 3
  posType: 'Yard' | 'Track' | 'HomeStretch' | 'Home';
  trackIndex: number; // 0 to 51
  stepsTraveled: number; // 0 to 50
  stretchIndex: number; // 0 to 4
}

export interface LudoPlayer {
  color: LudoColor;
  name: string;
  textColor: string;
  fillColor: string;
  bgBanner: string;
  bgLight: string;
}

// 52-cell track coordinates (clockwise)
const TRACK_COORDINATES = [
  { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
  { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
  { r: 0, c: 7 },
  { r: 0, c: 8 }, { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
  { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
  { r: 7, c: 14 },
  { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
  { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
  { r: 14, c: 7 },
  { r: 14, c: 6 }, { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
  { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
  { r: 7, c: 0 },
  { r: 6, c: 0 }
];

const START_TRACK_INDEX: Record<LudoColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39
};

const getStarIconForCell = (r: number, c: number) => {
  if (r === 2 && c === 6) return { color: '#e31b23' }; // Red star
  if (r === 6 && c === 12) return { color: '#00a859' }; // Green star
  if (r === 12 && c === 8) return { color: '#f59e0b' }; // Amber/yellow star for better contrast on white background
  if (r === 8 && c === 2) return { color: '#0054a6' }; // Blue star
  return null;
};

const HOME_STRETCH_COORDINATES: Record<LudoColor, { r: number; c: number }[]> = {
  RED: [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }],
  GREEN: [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }],
  YELLOW: [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }],
  BLUE: [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }]
};

const COLOR_HEX = {
  RED: '#e31b23',
  GREEN: '#00a859',
  YELLOW: '#fff200',
  BLUE: '#0054a6',
  WHITE: '#ffffff',
  BORDER: '#000000'
};

const PLAYER_TEMPLATES: Record<LudoColor, { houseName: string; textClass: string; banner: string; lightBg: string }> = {
  RED: { 
    houseName: 'Crimson Dragon', 
    textClass: 'text-red-500', 
    banner: 'bg-red-950/80 border-red-700 text-red-200', 
    lightBg: 'bg-red-500/10' 
  },
  GREEN: { 
    houseName: 'Emerald Wyrm', 
    textClass: 'text-green-500', 
    banner: 'bg-emerald-950/80 border-emerald-700 text-emerald-200', 
    lightBg: 'bg-emerald-500/10' 
  },
  YELLOW: { 
    houseName: 'Golden Gryphon', 
    textClass: 'text-amber-400', 
    banner: 'bg-amber-950/80 border-amber-700 text-amber-200', 
    lightBg: 'bg-amber-500/10' 
  },
  BLUE: { 
    houseName: 'Sapphire Falcon', 
    textClass: 'text-blue-400', 
    banner: 'bg-blue-950/80 border-blue-700 text-blue-200', 
    lightBg: 'bg-blue-500/10' 
  }
};

export const LudoGame: React.FC = () => {
  const { setLudoActive, config, selectedIds, setSelectedId, updateObject } = useEditorStore();

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

  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [playersCount, setPlayersCount] = useState<number>(4);
  
  // Custom names for each player
  const [playerNames, setPlayerNames] = useState<Record<LudoColor, string>>({
    RED: 'Crimson Clan',
    GREEN: 'Emerald Wyrm',
    YELLOW: 'Golden Citadel',
    BLUE: 'Sapphire Gate'
  });

  const [players, setPlayers] = useState<LudoPlayer[]>([]);
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [tokens, setTokens] = useState<Record<LudoColor, LudoToken[]>>({
    RED: [], GREEN: [], YELLOW: [], BLUE: []
  });

  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [consecutive6s, setConsecutive6s] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [boardStatusText, setBoardStatusText] = useState<string>('');
  const [winner, setWinner] = useState<LudoPlayer | null>(null);
  const [showNoMovesPrompt, setShowNoMovesPrompt] = useState<boolean>(false);
  const [stackSelection, setStackSelection] = useState<{
    row: number;
    col: number;
    movableTokens: { color: LudoColor; tokenId: number }[];
  } | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Load Ludo game progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fantasy_ludo_game_state_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tokens && parsed.players) {
          setGameState(parsed.gameState || 'setup');
          setPlayersCount(parsed.playersCount || 4);
          setPlayerNames(parsed.playerNames || {
            RED: 'Crimson Clan', GREEN: 'Emerald Wyrm', YELLOW: 'Golden Citadel', BLUE: 'Sapphire Gate'
          });
          setPlayers(parsed.players || []);
          setActivePlayerIdx(parsed.activePlayerIdx !== undefined ? parsed.activePlayerIdx : 0);
          setTokens(parsed.tokens);
          setDiceValue(parsed.diceValue || null);
          setHasRolled(parsed.hasRolled !== undefined ? parsed.hasRolled : false);
          setConsecutive6s(parsed.consecutive6s !== undefined ? parsed.consecutive6s : 0);
          setLogs(parsed.logs || []);
          setBoardStatusText(parsed.boardStatusText || '');
          setWinner(parsed.winner || null);
        }
      }
    } catch (err) {
      console.error("Failed to load Ludo game state from localStorage:", err);
    }
  }, []);

  // Save Ludo game progress dynamically when states change
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'finished') {
      try {
        localStorage.setItem('fantasy_ludo_game_state_v2', JSON.stringify({
          gameState,
          playersCount,
          playerNames,
          players,
          activePlayerIdx,
          tokens,
          diceValue,
          hasRolled,
          consecutive6s,
          logs,
          boardStatusText,
          winner
        }));
      } catch (err) {
        console.error("Failed to save Ludo game state to localStorage:", err);
      }
    }
  }, [gameState, playersCount, playerNames, players, activePlayerIdx, tokens, diceValue, hasRolled, consecutive6s, logs, boardStatusText, winner]);

  // Construct board status ledger
  useEffect(() => {
    if (gameState !== 'playing') return;

    const buildStatusReport = () => {
      const colorsToReport: LudoColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
      let report = `=========================================\nLUDO REAL-TIME CAMPAIGN LEDGER\n=========================================\n`;
      
      colorsToReport.forEach(col => {
        const playerTokens = tokens[col];
        if (playerTokens && playerTokens.length > 0) {
          const isParticipating = players.some(p => p.color === col);
          const factionLabel = isParticipating ? `${col} (Human)` : `${col} (Dormant)`;

          const tokensReport = playerTokens.map((t, idx) => {
            let desc = '';
            if (t.posType === 'Yard') desc = 'Yard';
            else if (t.posType === 'Home') desc = 'Goal!';
            else if (t.posType === 'HomeStretch') desc = `Stretch Row ${t.stretchIndex + 1}`;
            else desc = `Square ${t.trackIndex}`;

            return `Token ${idx + 1}: ${desc}`;
          }).join(', ');

          const bulletSymbol = col === 'RED' ? '🔴' : col === 'GREEN' ? '🟢' : col === 'YELLOW' ? '🟡' : '🔵';
          report += `${bulletSymbol} ${factionLabel.padEnd(16)}: [${tokensReport}]\n`;
        }
      });
      
      report += `=========================================`;
      setBoardStatusText(report);
    };

    buildStatusReport();
  }, [tokens, gameState, players]);

  const initializeGame = () => {
    const list: LudoColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const selectedColors = list.slice(0, playersCount);
    
    // Build real players
    const newPlayers: LudoPlayer[] = selectedColors.map(color => {
      const template = PLAYER_TEMPLATES[color];
      return {
        color,
        name: playerNames[color] || `${color} Lord`,
        textColor: template.textClass,
        fillColor: COLOR_HEX[color],
        bgBanner: template.banner,
        bgLight: template.lightBg
      };
    });

    // Reset tokens
    const initialTokens: Record<LudoColor, LudoToken[]> = {
      RED: [], GREEN: [], YELLOW: [], BLUE: []
    };

    list.forEach(col => {
      initialTokens[col] = Array.from({ length: 4 }).map((_, idx) => ({
        id: idx,
        posType: 'Yard',
        trackIndex: 0,
        stepsTraveled: 0,
        stretchIndex: 0
      }));
    });

    setPlayers(newPlayers);
    setTokens(initialTokens);
    setActivePlayerIdx(0);
    setDiceValue(null);
    setHasRolled(false);
    setConsecutive6s(0);
    setWinner(null);
    setShowNoMovesPrompt(false);

    setLogs([
      "🏰 Ludo Battle Arena Initialized!",
      "🎲 Local Pass and Play Mode enabled. No Bots/AI.",
      `🚩 Game loaded with ${playersCount} human players. Clockwise turns!`,
      `👉 ${newPlayers[0].name} (RED) takes the first turn.`
    ]);

    setGameState('playing');
  };

  const activePlayer = players[activePlayerIdx];

  const rollDice = () => {
    if (isRolling || hasRolled) return;

    setIsRolling(true);
    setDiceValue(null);
    setShowNoMovesPrompt(false);
    addLog(`🎲 ${activePlayer.name} spins the dice cup...`);

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setIsRolling(false);
      setHasRolled(true);

      const is6 = rolled === 6;
      let extra6s = consecutive6s;
      if (is6) {
        extra6s += 1;
        setConsecutive6s(extra6s);
        if (extra6s === 3) {
          addLog(`⚠️ BUSTED! Roll 6 three times in a row! Turn instantly forfeited!`);
          setConsecutive6s(0);
          advanceTurn(false);
          return;
        }
      } else {
        setConsecutive6s(0);
      }

      addLog(`🎲 ${activePlayer.name} rolled a: ${rolled}!`);

      // Solve legal moves
      const legal = getLegalMoves(activePlayer.color, rolled);
      if (legal.length === 0) {
        addLog(`🍂 No legal moves possible for ${activePlayer.name}! Click 'Pass Turn' to proceed.`);
        setShowNoMovesPrompt(true);
      }
    }, 800);
  };

  const getLegalMoves = (col: LudoColor, roll: number): { tokenId: number; details: string }[] => {
    const list = tokens[col];
    if (!list) return [];
    
    const valid: { tokenId: number; details: string }[] = [];

    list.forEach(token => {
      if (token.posType === 'Yard') {
        if (roll === 6) {
          valid.push({ 
            tokenId: token.id, 
            details: `Deploy Token ${token.id + 1} from Yard` 
          });
        }
      } else if (token.posType === 'Track') {
        const after = token.stepsTraveled + roll;
        if (after <= 50) {
          valid.push({ 
            tokenId: token.id, 
            details: `Advance Token ${token.id + 1} onto Track` 
          });
        } else if (after >= 51 && after <= 55) {
          valid.push({ 
            tokenId: token.id, 
            details: `Advance Token ${token.id + 1} into Home Stretch` 
          });
        } else if (after === 56) {
          valid.push({ 
            tokenId: token.id, 
            details: `Bring Token ${token.id + 1} Home!` 
          });
        }
      } else if (token.posType === 'HomeStretch') {
        const indexAfter = token.stretchIndex + roll;
        if (indexAfter <= 4) {
          valid.push({ 
            tokenId: token.id, 
            details: `Move Token ${token.id + 1} to space ${indexAfter + 1}` 
          });
        } else if (indexAfter === 5) {
          valid.push({ 
            tokenId: token.id, 
            details: `Secure Token ${token.id + 1} into Citadel` 
          });
        }
      }
    });

    return valid;
  };

  const executeMove = (col: LudoColor, tokenId: number, roll: number) => {
    let captured = false;
    let secureTriumph = false;

    setTokens(prev => {
      const list = [...prev[col]];
      const token = { ...list[tokenId] };

      if (token.posType === 'Yard') {
        token.posType = 'Track';
        token.trackIndex = START_TRACK_INDEX[col];
        token.stepsTraveled = 0;
        addLog(`🚪 ${col} Token ${tokenId + 1} deployed out onto START space!`);
      } else if (token.posType === 'Track') {
        const nextSteps = token.stepsTraveled + roll;
        if (nextSteps <= 50) {
          token.trackIndex = (token.trackIndex + roll) % 52;
          token.stepsTraveled = nextSteps;
          addLog(`🏃 ${col} Token ${tokenId + 1} runs to Square ${token.trackIndex}`);
        } else if (nextSteps >= 51 && nextSteps <= 55) {
          token.posType = 'HomeStretch';
          token.stretchIndex = nextSteps - 51;
          addLog(`🛡️ ${col} Token ${tokenId + 1} enters the safety of home stretch!`);
        } else if (nextSteps === 56) {
          token.posType = 'Home';
          secureTriumph = true;
          addLog(`👑 triumph! Token ${tokenId + 1} enters the Citadel home!`);
        }
      } else if (token.posType === 'HomeStretch') {
        const nextIdx = token.stretchIndex + roll;
        if (nextIdx <= 4) {
          token.stretchIndex = nextIdx;
          addLog(`🏃 Token ${tokenId + 1} advances inside stretch row to space ${nextIdx + 1}`);
        } else if (nextIdx === 5) {
          token.posType = 'Home';
          secureTriumph = true;
          addLog(`👑 triumph! Token ${tokenId + 1} enters the Citadel home!`);
        }
      }

      list[tokenId] = token;
      const nextObj = { ...prev, [col]: list };

      // Capturing opponents check
      if (token.posType === 'Track') {
        if ([8, 21, 34, 47].includes(token.trackIndex)) {
          addLog(`⭐ Safe Zone! ${col} Token ${tokenId + 1} enters an ancient Star Sanctuary on Square ${token.trackIndex}! No capture possible here.`);
        } else {
          const opponents: LudoColor[] = (['RED', 'GREEN', 'YELLOW', 'BLUE'] as LudoColor[]).filter(c => c !== col);
          opponents.forEach(opCol => {
            const peers = nextObj[opCol];
            if (!peers) return;

            nextObj[opCol] = peers.map(p => {
              if (p.posType === 'Track' && p.trackIndex === token.trackIndex) {
                captured = true;
                addLog(`⚔️ AMBUSH! ${col} captures ${opCol} Token ${p.id + 1} on Square ${token.trackIndex}!`);
                addLog(`💨 Captured ${opCol} Token retreats back to Yard!`);
                return { ...p, posType: 'Yard', trackIndex: 0, stepsTraveled: 0, stretchIndex: 0 };
              }
              return p;
            });
          });
        }
      }

      return nextObj;
    });

    // Check Victory condition (4 pieces Home)
    setTimeout(() => {
      const allHome = tokens[col]?.filter(t => t.posType === 'Home').length === 3 && secureTriumph 
        || tokens[col]?.every(t => t.posType === 'Home');

      if (allHome) {
        setWinner(activePlayer);
        setGameState('finished');
        addLog(`🏆🎉 GLORIOUS CONQUEST! ${activePlayer.name} has claimed absolute supremacy! All 4 tokens secured inside the center Home Citadel.`);
        return;
      }

      const hitBonus = roll === 6 || captured || secureTriumph;
      if (hitBonus) {
        if (roll === 6) addLog(`✨ Roll again! 6 grants a bonus turn.`);
        else if (captured) addLog(`✨ Glory! Capturing an opponent grants a bonus turn.`);
        else if (secureTriumph) addLog(`✨ Citadel! Housing a token grants a bonus turn.`);
      }

      advanceTurn(hitBonus);
    }, 300);
  };

  const advanceTurn = (bonus: boolean) => {
    setHasRolled(false);
    setDiceValue(null);
    setShowNoMovesPrompt(false);

    if (!bonus) {
      setConsecutive6s(0);
      setActivePlayerIdx(prev => {
        const nextIdx = (prev + 1) % players.length;
        addLog(`👉 ${players[nextIdx].name}'s turn to move!`);
        return nextIdx;
      });
    } else {
      addLog(`👉 ${activePlayer.name} keeps the dice cup for their bonus turn!`);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const isCurrentMovableToken = (col: LudoColor, tokenId: number): boolean => {
    if (gameState !== 'playing' || isRolling || !activePlayer || activePlayer.color !== col || diceValue === null) return false;
    const moves = getLegalMoves(col, diceValue);
    return moves.some(m => m.tokenId === tokenId);
  };

  const handleStackClick = (r: number, c: number, cTokens: { color: LudoColor; tokenId: number }[]) => {
    if (gameState !== 'playing' || isRolling || diceValue === null) return;
    const movableInside = cTokens.filter(ct => isCurrentMovableToken(ct.color, ct.tokenId));
    if (movableInside.length === 0) return;
    if (movableInside.length === 1) {
      executeMove(movableInside[0].color, movableInside[0].tokenId, diceValue);
    } else {
      setStackSelection({
        row: r,
        col: c,
        movableTokens: movableInside
      });
    }
  };

  // Safe checks for rendering cell backgrounds
  const getTrackCellBg = (r: number, c: number): string => {
    // Red Start
    if (r === 6 && c === 1) return COLOR_HEX.RED;
    // Red Home Stretch
    if (r === 7 && c >= 1 && c <= 5) return COLOR_HEX.RED;
    
    // Green Start
    if (r === 1 && c === 8) return COLOR_HEX.GREEN;
    // Green Home Stretch
    if (c === 7 && r >= 1 && r <= 5) return COLOR_HEX.GREEN;
    
    // Yellow Start
    if (r === 8 && c === 13) return COLOR_HEX.YELLOW;
    // Yellow Home Stretch
    if (r === 7 && c >= 9 && c <= 13) return COLOR_HEX.YELLOW;
    
    // Blue Start
    if (r === 13 && c === 6) return COLOR_HEX.BLUE;
    // Blue Home Stretch
    if (c === 7 && r >= 9 && r <= 13) return COLOR_HEX.BLUE;

    // Normal path
    return COLOR_HEX.WHITE;
  };

  // Retrieve tokens positioned on standard track or stretch
  const getTokensAtCellCoord = (r: number, c: number) => {
    const list: { color: LudoColor; tokenId: number }[] = [];
    const colorOrder: LudoColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

    colorOrder.forEach(col => {
      const ts = tokens[col];
      if (!ts) return;
      ts.forEach(token => {
        if (token.posType === 'Track') {
          const coord = TRACK_COORDINATES[token.trackIndex];
          if (coord && coord.r === r && coord.c === c) {
            list.push({ color: col, tokenId: token.id });
          }
        } else if (token.posType === 'HomeStretch') {
          const coord = HOME_STRETCH_COORDINATES[col][token.stretchIndex];
          if (coord && coord.r === r && coord.c === c) {
            list.push({ color: col, tokenId: token.id });
          }
        }
      });
    });

    return list;
  };

  // Standard token bead element render
  const renderTokenBead = (color: LudoColor, tokenId: number) => {
    const isMovable = isCurrentMovableToken(color, tokenId);
    
    const colorClasses = {
      RED: 'bg-[#e31b23] border-white text-white',
      GREEN: 'bg-[#00a859] border-white text-white',
      YELLOW: 'bg-[#fff200] border-black text-black',
      BLUE: 'bg-[#0054a6] border-white text-white'
    }[color];

    return (
      <motion.button
        key={`${color}-${tokenId}`}
        id={`token-${color}-${tokenId}`}
        whileHover={isMovable ? { scale: 1.3, zIndex: 40 } : {}}
        onClick={(e) => {
          e.stopPropagation();
          if (isMovable && diceValue !== null) {
            executeMove(color, tokenId, diceValue);
          }
        }}
        className={`
          w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 text-[9px] font-extrabold focus:outline-none shadow-md transition-transform
          ${colorClasses}
          ${isMovable ? 'animate-bounce cursor-pointer scale-110 ring-2 ring-emerald-400 z-30' : 'opacity-100'}
        `}
        style={isMovable ? { boxShadow: '0 0 12px #10b981' } : {}}
      >
        {tokenId + 1}
      </motion.button>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[630px] bg-[#0c0a09] border border-stone-800 rounded-lg flex shadow-2xl overflow-hidden text-stone-200 font-sans">
      
      {/* LEFT: Classic Board Frame (exactly matching picture) */}
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-900 border-r border-[#2d2824] p-4 overflow-hidden relative">
        {gameState === 'setup' ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-md w-full relative z-10 bg-black/40 border border-stone-800 rounded-xl">
            <div className="w-14 h-14 rounded-full border border-yellow-500/20 flex items-center justify-center bg-yellow-500/5">
              <Compass className="w-8 h-8 text-yellow-500 animate-spin-slow" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold uppercase tracking-wider text-yellow-500">Local Ludo Citadel</h2>
              <p className="text-[11px] text-stone-400">Assemble campaign houses and roll the dice on a pass-and-play tabletop battlefield!</p>
            </div>

            <div className="w-full space-y-4 pt-4 border-t border-stone-800">
              <div className="space-y-1 text-left">
                <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Number of Match Lords</span>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setPlayersCount(num)}
                      className={`py-2 rounded border text-xs font-bold transition-all ${playersCount === num ? 'bg-yellow-500 text-stone-950 border-yellow-400 font-black' : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'}`}
                    >
                      {num} Players
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic name inputs for human players */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">Lord Names</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as LudoColor[]).slice(0, playersCount).map(color => (
                    <div key={color} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-black/40 flex-shrink-0" style={{ backgroundColor: COLOR_HEX[color] }} />
                      <input
                        type="text"
                        value={playerNames[color]}
                        placeholder={`${color} Player`}
                        maxLength={18}
                        onChange={(e) => setPlayerNames(prev => ({ ...prev, [color]: e.target.value }))}
                        className="flex-1 bg-stone-950 border border-stone-800 text-stone-200 text-xs px-2 py-1.5 rounded focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={initializeGame}
                className="w-full py-3 bg-yellow-500 text-stone-950 rounded text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Start Battle Campaign
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            
            {/* Board Core Container */}
            <div 
              id="ludo-board-container"
              onClick={() => setSelectedId(null)}
              className="w-full max-w-[430px] aspect-square bg-[#000] p-1 border-[6px] border-black shadow-2xl relative select-none"
            >
              
              {/* 15x15 Flat Layout */}
              <div className="w-full h-full grid grid-cols-15 grid-rows-15 bg-white relative">
                
                {/* 1. yards */}
                {/* RED YARD (0-5, 0-5) */}
                <div 
                  style={{ gridRow: '1 / 7', gridColumn: '1 / 7' }}
                  className="bg-[#e31b23] border border-black p-[12%] flex items-center justify-center"
                >
                  <div className="w-full h-full bg-white border border-black grid grid-cols-2 grid-rows-2 p-[8%] gap-[12%] relative">
                    {[0, 1, 2, 3].map(idx => (
                      <div key={idx} className="w-full aspect-square rounded-full bg-[#e31b23] border border-black flex items-center justify-center relative shadow-inner">
                        {tokens.RED.find(t => t.id === idx && t.posType === 'Yard') && renderTokenBead('RED', idx)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* GREEN YARD (0-5, 9-14) */}
                <div 
                  style={{ gridRow: '1 / 7', gridColumn: '10 / 16' }}
                  className="bg-[#00a859] border border-black p-[12%] flex items-center justify-center"
                >
                  <div className="w-full h-full bg-white border border-black grid grid-cols-2 grid-rows-2 p-[8%] gap-[12%] relative">
                    {[0, 1, 2, 3].map(idx => (
                      <div key={idx} className="w-full aspect-square rounded-full bg-[#00a859] border border-black flex items-center justify-center relative shadow-inner">
                        {tokens.GREEN.find(t => t.id === idx && t.posType === 'Yard') && renderTokenBead('GREEN', idx)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* BLUE YARD (9-14, 0-5) */}
                <div 
                  style={{ gridRow: '10 / 16', gridColumn: '1 / 7' }}
                  className="bg-[#0054a6] border border-black p-[12%] flex items-center justify-center"
                >
                  <div className="w-full h-full bg-white border border-black grid grid-cols-2 grid-rows-2 p-[8%] gap-[12%] relative">
                    {[0, 1, 2, 3].map(idx => (
                      <div key={idx} className="w-full aspect-square rounded-full bg-[#0054a6] border border-black flex items-center justify-center relative shadow-inner">
                        {tokens.BLUE.find(t => t.id === idx && t.posType === 'Yard') && renderTokenBead('BLUE', idx)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* YELLOW YARD (9-14, 9-14) */}
                <div 
                  style={{ gridRow: '10 / 16', gridColumn: '10 / 16' }}
                  className="bg-[#fff200] border border-black p-[12%] flex items-center justify-center"
                >
                  <div className="w-full h-full bg-white border border-black grid grid-cols-2 grid-rows-2 p-[8%] gap-[12%] relative">
                    {[0, 1, 2, 3].map(idx => (
                      <div key={idx} className="w-full aspect-square rounded-full bg-[#fff200] border border-black flex items-center justify-center relative shadow-inner">
                        {tokens.YELLOW.find(t => t.id === idx && t.posType === 'Yard') && renderTokenBead('YELLOW', idx)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. CENTER TRIANGLE INTERSECTION */}
                <div 
                  style={{ gridRow: '7 / 10', gridColumn: '7 / 10' }}
                  className="relative w-full h-full bg-white border border-black overflow-hidden select-none"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                    <polygon points="0,0 50,50 0,100" fill="#e31b23" stroke="#000" strokeWidth="1.2" />
                    <polygon points="0,0 100,0 50,50" fill="#00a859" stroke="#000" strokeWidth="1.2" />
                    <polygon points="100,0 100,100 50,50" fill="#fff200" stroke="#000" strokeWidth="1.2" />
                    <polygon points="0,100 100,100 50,50" fill="#0054a6" stroke="#000" strokeWidth="1.2" />
                  </svg>

                  {/* Center white circle with a gold star */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-black/40 flex items-center justify-center z-10 shadow-md">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-500 fill-amber-500">
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  </div>

                  {/* Red home tokens cluster layout */}
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-20">
                    {tokens.RED.filter(t => t.posType === 'Home').map(t => (
                      <div key={t.id} className="w-3.5 h-3.5 rounded-full bg-[#e31b23] border border-white flex items-center justify-center text-[7px] font-black">{t.id + 1}</div>
                    ))}
                  </div>

                  {/* Green home tokens cluster layout */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                    {tokens.GREEN.filter(t => t.posType === 'Home').map(t => (
                      <div key={t.id} className="w-3.5 h-3.5 rounded-full bg-[#00a859] border border-white flex items-center justify-center text-[7px] font-black">{t.id + 1}</div>
                    ))}
                  </div>

                  {/* Yellow home tokens cluster layout */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-20">
                    {tokens.YELLOW.filter(t => t.posType === 'Home').map(t => (
                      <div key={t.id} className="w-3.5 h-3.5 rounded-full bg-[#fff200] border-black text-black border flex items-center justify-center text-[7px] font-black">{t.id + 1}</div>
                    ))}
                  </div>

                  {/* Blue home tokens cluster layout */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                    {tokens.BLUE.filter(t => t.posType === 'Home').map(t => (
                      <div key={t.id} className="w-3.5 h-3.5 rounded-full bg-[#0054a6] border border-white flex items-center justify-center text-[7px] font-black">{t.id + 1}</div>
                    ))}
                  </div>
                </div>

                {/* 3. TRACK CELLS & TOKENS */}
                {Array.from({ length: 15 }).map((_, r) => (
                  Array.from({ length: 15 }).map((__, c) => {
                    const inYard = (r < 6 && c < 6) || (r < 6 && c >= 9) || (r >= 9 && c < 6) || (r >= 9 && c >= 9);
                    const inCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;
                    if (inYard || inCenter) return null;

                    const cellBg = getTrackCellBg(r, c);
                    const cTokens = getTokensAtCellCoord(r, c);
                    const starInfo = getStarIconForCell(r, c);

                    const movableTokens = cTokens.filter(ct => isCurrentMovableToken(ct.color, ct.tokenId));

                    return (
                      <div 
                        key={`${r}-${c}`}
                        style={{ gridRow: r + 1, gridColumn: c + 1, backgroundColor: cellBg }}
                        className="border border-black flex items-center justify-center relative aspect-square"
                      >
                        {starInfo && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-0.5 z-0">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6" fill={starInfo.color} stroke="none">
                              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                            </svg>
                          </div>
                        )}
                        {cTokens.length > 0 && (
                          <div 
                            onClick={(e) => {
                              if (cTokens.length > 1) {
                                e.stopPropagation();
                                handleStackClick(r, c, cTokens);
                              }
                            }}
                            className={`absolute inset-0 flex items-center justify-center overflow-visible z-10 w-full h-full ${cTokens.length > 1 && movableTokens.length > 0 ? 'cursor-pointer' : ''}`}
                          >
                            {cTokens.length === 1 ? (
                              renderTokenBead(cTokens[0].color, cTokens[0].tokenId)
                            ) : (
                              <div className="relative w-5 h-5 md:w-6 md:h-6 flex items-center justify-center overflow-visible">
                                {cTokens.map((ct, idx) => {
                                  const isMovable = isCurrentMovableToken(ct.color, ct.tokenId);
                                  const colorClasses = {
                                    RED: 'bg-[#e31b23] border-white text-white',
                                    GREEN: 'bg-[#00a859] border-white text-white',
                                    YELLOW: 'bg-[#fff200] border-black text-black',
                                    BLUE: 'bg-[#0054a6] border-white text-white'
                                  }[ct.color];

                                  return (
                                    <motion.div
                                      key={`${ct.color}-${ct.tokenId}`}
                                      whileHover={isMovable ? { scale: 1.3, zIndex: 40 } : {}}
                                      className={`
                                        w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 text-[9px] font-extrabold shadow-md transition-transform select-none
                                        ${colorClasses}
                                        ${isMovable && diceValue !== null ? 'animate-bounce scale-110' : ''}
                                      `}
                                      style={{
                                        position: 'absolute',
                                        zIndex: idx + 10,
                                        top: idx * -2,
                                        left: idx * 2,
                                        ...(isMovable ? { boxShadow: '0 0 12px #10b981' } : {})
                                      }}
                                    >
                                      {ct.tokenId + 1}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}

              </div>

              {/* 3D Stack Choice Selection Overlay */}
              <AnimatePresence>
                {stackSelection && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4 rounded"
                  >
                    <div className="bg-[#0e0c0b] border border-yellow-500/30 rounded-lg p-4 max-w-[280px] w-full text-center space-y-3 shadow-2xl relative">
                      <button
                        onClick={() => setStackSelection(null)}
                        className="absolute top-3 right-3 text-stone-500 hover:text-stone-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-1">
                        <h3 className="text-stone-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-yellow-500" /> Choose Token
                        </h3>
                        <p className="text-[10px] text-stone-400">
                          Select which token to advance by <strong className="text-yellow-400">{diceValue}</strong> spaces:
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {stackSelection.movableTokens.map(tok => {
                          const bgBeadStyle = {
                            RED: 'bg-[#e31b23] border-white text-white',
                            GREEN: 'bg-[#00a859] border-white text-white',
                            YELLOW: 'bg-[#fff200] border-black text-black',
                            BLUE: 'bg-[#0054a6] border-white text-white'
                          }[tok.color];

                          return (
                            <button
                              key={tok.tokenId}
                              onClick={() => {
                                executeMove(tok.color, tok.tokenId, diceValue!);
                                setStackSelection(null);
                              }}
                              className="w-full text-left p-2 rounded bg-stone-900 border border-stone-800 hover:border-yellow-500/80 hover:bg-yellow-500/10 flex items-center gap-3 transition-colors text-xs font-semibold"
                            >
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black font-mono shadow ${bgBeadStyle}`}>
                                {tok.tokenId + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-stone-200">Token {tok.tokenId + 1}</div>
                                <div className="text-[8px] text-stone-500 uppercase">Deploy next movement</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        )}
      </div>

      {/* RIGHT: Stats Ledger, Action Cards & Dynamic Console Logs */}
      <div className="w-80 flex flex-col bg-stone-950 overflow-hidden relative border-l border-stone-900">
        <div className="p-4 border-b border-stone-800 bg-[#070605] flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-500 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" /> Faction Ledger
          </span>
          {gameState === 'playing' && (
            <span className="text-[8px] font-mono bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-stone-300">
              Turn: {activePlayer?.color}
            </span>
          )}
        </div>

        {gameState === 'setup' ? (
          <div className="flex-1 p-5 text-stone-500 italic text-[10px] leading-relaxed flex flex-col items-center justify-center text-center space-y-3">
            <AlertTriangle className="w-6 h-6 opacity-30 text-yellow-500" />
            <p>Gather your local lords in the mobilizer panel to record logs and take tactical turns in the battlefield.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Logs Window */}
            <div ref={logContainerRef} className="flex-grow overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-black/40 font-mono text-[9.5px] border-b border-stone-800">
              {logs.map((log, i) => {
                let textCol = 'text-stone-400';
                if (log.includes('AMBUSH!')) textCol = 'text-red-400 font-bold bg-[#1d100f] px-1 py-0.5 border border-red-900/40 rounded';
                else if (log.includes('rolled a:')) textCol = 'text-yellow-400 font-semibold';
                else if (log.includes('triumph!')) textCol = 'text-green-400 font-bold bg-[#101c13] px-1 py-0.5 border border-green-900/40 rounded';
                else if (log.includes('deployed out')) textCol = 'text-blue-400';
                else if (log.includes('No legal moves')) textCol = 'text-amber-500/80 italic';
                else if (log.includes('Lords')) textCol = 'text-yellow-500';

                return (
                  <div key={i} className={`flex items-start gap-1 pb-1 border-b border-stone-900/20 ${textCol}`}>
                    <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-30" />
                    <span>{log}</span>
                  </div>
                );
              })}
            </div>

            {/* Custom Dice Dashboard */}
            <div className="p-4 bg-stone-900/60 border-t border-stone-800 relative flex flex-col items-center justify-center gap-3">
              
              {gameState === 'finished' ? (
                <div className="w-full text-center space-y-3 py-1">
                  <div className="flex items-center justify-center gap-1.5 text-yellow-500 font-bold uppercase tracking-wider text-xs">
                    <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" /> {winner?.name} Conquered!
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('fantasy_ludo_game_state_v2');
                      setGameState('setup');
                    }}
                    className="w-full py-2 bg-yellow-500 text-stone-950 rounded text-xs font-bold uppercase hover:bg-yellow-400 transition-all font-sans"
                  >
                    Mobilize New Battle
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  {/* Whos Turn Indicator Card */}
                  <div className={`p-2.5 rounded border flex items-center gap-3 ${activePlayer?.bgBanner}`}>
                    <div className="w-6 h-6 rounded-full border border-black/30 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: activePlayer?.fillColor }}>
                      <Crown className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] uppercase tracking-widest text-stone-400 font-semibold">Active Lord</p>
                      <h4 className="text-xs font-bold truncate text-white">{activePlayer?.name}</h4>
                    </div>
                  </div>

                  {/* Dice roll tray */}
                  <div className="flex items-center justify-between gap-3 p-2 bg-stone-950 rounded border border-stone-800">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={isRolling ? { 
                          rotate: [0, 90, 180, 270, 360],
                          scale: [1, 1.25, 1],
                        } : {}}
                        transition={{ duration: 0.7 }}
                        onClick={() => { if (!hasRolled && !isRolling) rollDice(); }}
                        className={`
                          w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-black font-mono cursor-pointer transition-all
                          ${isRolling ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300' 
                            : diceValue ? 'border-yellow-500 bg-yellow-600/10 text-yellow-400' 
                            : 'border-stone-800 bg-[#0e0c0b] text-stone-600'}
                        `}
                      >
                        {isRolling ? <Dices className="w-6 h-6 animate-pulse" /> : diceValue || "-"}
                      </motion.div>
                      
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Fates rolled</span>
                        <span className="text-[8px] text-stone-500 font-mono">
                          {isRolling ? "Sifting..." : diceValue ? `Rolled: ${diceValue}` : "Ready to roll"}
                        </span>
                      </div>
                    </div>

                    {!hasRolled && !isRolling ? (
                      <button
                        onClick={rollDice}
                        className="py-2.5 px-4 bg-yellow-500 text-stone-950 font-bold uppercase text-[10px] tracking-wider hover:bg-yellow-400 rounded flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Dices className="w-3.5 h-3.5" /> Cast Dice
                      </button>
                    ) : showNoMovesPrompt ? (
                      <button
                        onClick={() => advanceTurn(false)}
                        className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold uppercase text-[10px] tracking-wider rounded flex items-center gap-1.5 transition-all"
                      >
                        Pass Turn
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#10b981] font-extrabold animate-pulse uppercase tracking-wider pr-2">
                        Click token!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Status Report Printed Area */}
              <div className="w-full pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-stone-500">Board Status Ledger</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(boardStatusText);
                      addLog("📋 Board status ledger copied to parchment clipboard!");
                    }}
                    className="text-[8px] underline text-yellow-500/60 hover:text-yellow-400 transition-colors"
                  >
                    Copy Report
                  </button>
                </div>
                <pre className="w-full bg-black/60 border border-stone-900 text-[7px] font-mono p-1.5 text-stone-400 leading-tight select-all whitespace-pre overflow-x-auto">
                  {boardStatusText}
                </pre>
              </div>

              {/* Retreat Button to exit back to normal canvas draft */}
              <button
                onClick={() => {
                  if (confirm("Forfeit active campaign and return to design drafts?")) {
                    setLudoActive(false);
                  }
                }}
                className="w-full mt-1.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 text-[9px] uppercase tracking-wider rounded transition-colors"
              >
                Retreat to draw board
              </button>

            </div>

          </div>
        )}

      </div>
      
    </div>
  );
};
