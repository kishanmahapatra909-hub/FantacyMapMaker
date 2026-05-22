export type BoardShape = 'Rectangle' | 'Square' | 'Circle' | 'Hexagon' | 'Ancient Scroll' | 'Island Shape' | 'Dragon Shape' | 'Triangle';

export interface EditorObject {
  id: string;
  type: 'path' | 'obstacle' | 'stage' | 'decoration' | 'checkpoint' | 'text';
  subType: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  stroke?: string;
  points?: number[]; // for paths
  text?: string; // for text labels
  src?: string; // for images
  metadata?: any;
}

export interface GameRules {
  title: string;
  players: string;
  winConditions: string;
  movementRules: string;
  diceRules: string;
  specialPowers: string;
  rewards: string;
  penalties: string;
  bossRules: string;
  checkpointRules: string;
  specialNotes: string;
  instructions: string;
}

export interface BoardConfig {
  name: string;
  background: string | null;
  boardShape: BoardShape;
  objects: EditorObject[];
  rules: GameRules;
}
