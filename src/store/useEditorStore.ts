import { create } from 'zustand';
import { BoardConfig, EditorObject, GameRules, BoardShape } from '../types';

interface HistoryState {
  past: BoardConfig[];
  future: BoardConfig[];
}

interface EditorState {
  config: BoardConfig;
  selectedIds: string[];
  zoom: number;
  isDrawing: boolean;
  drawingColor: string;
  stage: any | null;
  isFullScreen: boolean;
  isIncinerating: boolean;
  ludoActive: boolean;
  snakesActive: boolean;
  tictactoeActive: boolean;
  ludoGameId: string;
  snakesGameId: string;
  tictactoeGameId: string;
  
  // Actions
  setLudoActive: (active: boolean) => void;
  setSnakesActive: (active: boolean) => void;
  setTictactoeActive: (active: boolean) => void;
  setName: (name: string) => void;
  setBackground: (url: string | null) => void;
  setBoardShape: (shape: BoardShape) => void;
  addObject: (obj: Omit<EditorObject, 'id'>) => void;
  updateObject: (id: string, updates: Partial<EditorObject>) => void;
  removeObject: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectedId: (id: string) => void;
  deleteSelected: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  setZoom: (zoom: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setDrawingColor: (color: string) => void;
  setStage: (stage: any | null) => void;
  setIncinerating: (isIncinerating: boolean) => void;
  toggleFullScreen: () => void;
  updateRules: (updates: Partial<GameRules>) => void;
  resetBoard: () => void;
  clearObjects: () => void;
  incinerate: () => void;
  saveConfig: () => void;
  loadConfig: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  history: HistoryState;
}

const initialRules: GameRules = {
  title: '',
  players: '',
  winConditions: '',
  movementRules: '',
  diceRules: '',
  specialPowers: '',
  rewards: '',
  penalties: '',
  bossRules: '',
  checkpointRules: '',
  specialNotes: '',
  instructions: '',
};

const initialConfig: BoardConfig = {
  name: 'New Adventure',
  background: null,
  boardShape: 'Rectangle',
  objects: [],
  rules: initialRules,
};

export const useEditorStore = create<EditorState>((set, get) => {
  const saveToHistory = (newConfig: BoardConfig) => {
    const { config, history } = get();
    set({
      history: {
        past: [...history.past, config].slice(-50), // Keep last 50 states
        future: [],
      }
    });
  };

  return {
    config: initialConfig,
    selectedIds: [],
    zoom: 1,
    isDrawing: false,
    drawingColor: '#8b4513',
    stage: null,
    isFullScreen: false,
    isIncinerating: false,
    ludoActive: false,
    snakesActive: false,
    tictactoeActive: false,
    ludoGameId: Math.random().toString(36).substring(2, 9),
    snakesGameId: Math.random().toString(36).substring(2, 9),
    tictactoeGameId: Math.random().toString(36).substring(2, 9),
    history: {
      past: [],
      future: [],
    },

    setLudoActive: (ludoActive) => {
      if (ludoActive) {
        try {
          localStorage.removeItem('fantasy_ludo_game_state_v2');
        } catch (e) {
          console.error(e);
        }
      }
      set({ 
        ludoActive, 
        snakesActive: ludoActive ? false : get().snakesActive,
        tictactoeActive: ludoActive ? false : get().tictactoeActive,
        ludoGameId: Math.random().toString(36).substring(2, 9)
      });
    },
    setSnakesActive: (snakesActive) => {
      if (snakesActive) {
        try {
          localStorage.removeItem('fantasy_snakes_game_state_v2');
        } catch (e) {
          console.error(e);
        }
      }
      set({ 
        snakesActive, 
        ludoActive: snakesActive ? false : get().ludoActive,
        tictactoeActive: snakesActive ? false : get().tictactoeActive,
        snakesGameId: Math.random().toString(36).substring(2, 9)
      });
    },
    setTictactoeActive: (tictactoeActive) => {
      if (tictactoeActive) {
        try {
          localStorage.removeItem('fantasy_tictactoe_game_state_v2');
        } catch (e) {
          console.error(e);
        }
      }
      set({
        tictactoeActive,
        ludoActive: tictactoeActive ? false : get().ludoActive,
        snakesActive: tictactoeActive ? false : get().snakesActive,
        tictactoeGameId: Math.random().toString(36).substring(2, 9)
      });
    },
    setName: (name) => {
      saveToHistory(get().config);
      set((state) => ({ config: { ...state.config, name } }));
    },
    setBackground: (background) => {
      saveToHistory(get().config);
      set((state) => ({ config: { ...state.config, background } }));
    },
    setBoardShape: (boardShape) => {
      saveToHistory(get().config);
      set((state) => ({ config: { ...state.config, boardShape } }));
    },
    
    addObject: (obj) => {
      saveToHistory(get().config);
      const newId = Math.random().toString(36).substr(2, 9);
      set((state) => ({
        config: {
          ...state.config,
          objects: [...state.config.objects, { ...obj, id: newId } as EditorObject],
        },
        selectedIds: [newId]
      }));
    },

    updateObject: (id, updates) => {
      // Don't save to history for every small update (like dragging)
      // Maybe save on drag end? For now let's save to be safe, or throttle.
      set((state) => ({
        config: {
          ...state.config,
          objects: state.config.objects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        }
      }));
    },

    removeObject: (id) => {
      saveToHistory(get().config);
      set((state) => ({
        config: {
          ...state.config,
          objects: state.config.objects.filter((o) => o.id !== id),
        },
        selectedIds: state.selectedIds.filter((sid) => sid !== id),
      }));
    },

    setSelectedId: (selectedId) => set({ selectedIds: selectedId ? [selectedId] : [] }),
    setSelectedIds: (selectedIds) => set({ selectedIds }),
    toggleSelectedId: (id) => {
      const { selectedIds } = get();
      if (selectedIds.includes(id)) {
        set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
      } else {
        set({ selectedIds: [...selectedIds, id] });
      }
    },
    deleteSelected: () => {
      const { selectedIds, config } = get();
      if (selectedIds.length === 0) return;
      
      saveToHistory(config);
      set({ isIncinerating: true });

      setTimeout(() => {
        set((state) => ({
          config: {
            ...state.config,
            objects: state.config.objects.filter((o) => !selectedIds.includes(o.id)),
          },
          selectedIds: [],
          isIncinerating: false,
        }));
      }, 850);
    },
    bringToFront: (id) => {
      saveToHistory(get().config);
      set((state) => {
        const obj = state.config.objects.find((o) => o.id === id);
        if (!obj) return state;
        const others = state.config.objects.filter((o) => o.id !== id);
        return {
          config: {
            ...state.config,
            objects: [...others, obj],
          }
        };
      });
    },
    sendToBack: (id) => {
      saveToHistory(get().config);
      set((state) => {
        const obj = state.config.objects.find((o) => o.id === id);
        if (!obj) return state;
        const others = state.config.objects.filter((o) => o.id !== id);
        return {
          config: {
            ...state.config,
            objects: [obj, ...others],
          }
        };
      });
    },
    setZoom: (zoom) => set({ zoom }),
    setIsDrawing: (isDrawing) => set({ isDrawing, selectedIds: isDrawing ? [] : get().selectedIds }),
    setDrawingColor: (drawingColor) => set({ drawingColor }),
    setStage: (stage) => set({ stage }),
    setIncinerating: (isIncinerating) => set({ isIncinerating }),
    toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
    
    updateRules: (updates) => {
      saveToHistory(get().config);
      set((state) => ({
        config: {
          ...state.config,
          rules: { ...state.config.rules, ...updates },
        }
      }));
    },

    resetBoard: () => {
      saveToHistory(get().config);
      set({ config: initialConfig, selectedIds: [], zoom: 1, isDrawing: false });
    },

    clearObjects: () => {
      saveToHistory(get().config);
      set((state) => ({
        config: {
          ...state.config,
          objects: [],
        },
        selectedIds: [],
        isDrawing: false,
      }));
    },

    incinerate: () => {
      const { config } = get();
      const allIds = config.objects.map(obj => obj.id);
      if (allIds.length === 0) return;
      
      saveToHistory(config);
      // Select all objects and start incineration animation
      set({ selectedIds: allIds, isIncinerating: true });
      
      setTimeout(() => {
        set((state) => ({
          config: {
            ...state.config,
            objects: [],
          },
          selectedIds: [],
          isIncinerating: false,
        }));
      }, 850);
    },

    saveConfig: () => {
      const { config } = get();
      localStorage.setItem('map-builder-config', JSON.stringify(config));
    },

    loadConfig: () => {
      const saved = localStorage.getItem('map-builder-config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          set({ config: parsed });
        } catch (e) {
          console.error('Failed to parse saved config', e);
        }
      }
    },

    undo: () => {
      const { history, config } = get();
      if (history.past.length === 0) return;

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, history.past.length - 1);

      set({
        config: previous,
        history: {
          past: newPast,
          future: [config, ...history.future],
        }
      });
    },

    redo: () => {
      const { history, config } = get();
      if (history.future.length === 0) return;

      const next = history.future[0];
      const newFuture = history.future.slice(1);

      set({
        config: next,
        history: {
          past: [...history.past, config],
          future: newFuture,
        }
      });
    },
  };
});
