export interface Sticker {
  id: string;
  word: string;
  imageData: string; // Base64 string
  createdAt: number;
}

export interface JudgeResult {
  isMatch: boolean;
  feedback: string;
}

export enum GamePhase {
  START_SCREEN = 'START_SCREEN',
  DRAWING = 'DRAWING',
  JUDGING = 'JUDGING',
  RESULT_SUCCESS = 'RESULT_SUCCESS',
  RESULT_FAIL = 'RESULT_FAIL',
  STICKER_BOOK = 'STICKER_BOOK'
}

export type ToolType = 'pen' | 'eraser';

export interface DrawingTool {
  type: ToolType;
  color: string;
  size: number;
}
