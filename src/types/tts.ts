export interface TTSRequest {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav';
}

export interface TTSResponse {
  taskId: string;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
}

export interface TTSError {
  message: string;
  code?: string;
}

export type TTSStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'error';