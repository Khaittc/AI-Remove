export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string;
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface ErrorState {
  hasError: boolean;
  message: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}