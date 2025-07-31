import { TTSRequest, TTSResponse, Voice, TTSError } from '../types/tts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://emmanueltigo.pythonanywhere.com';
const MAX_RETRIES = 10;
const RETRY_DELAY = 2000; // 2 seconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

class APIError extends Error {
  code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'APIError';
    this.code = code;
  }
}

// Create fetch with timeout
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

export const ttsAPI = {
  // Submit text for TTS conversion
  async convertText(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error: TTSError = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new APIError(error.message, error.code);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timed out. Please try again.');
      }
      throw new APIError('Failed to submit text for conversion.');
    }
  },

  // Poll for audio result
  async getAudio(taskId: string): Promise<Blob> {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/tts/${taskId}`);
        
        if (response.status === 202) {
          // Still processing, wait and retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          retries++;
          continue;
        }
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('audio/')) {
            return await response.blob();
          }
          throw new APIError('Invalid response format - expected audio data.');
        }
        
        const error: TTSError = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new APIError(error.message, error.code);
        
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIError('Request timed out. Please try again.');
        }
        
        // If it's the last retry, throw the error
        if (retries >= MAX_RETRIES - 1) {
          throw new APIError('Failed to retrieve audio after multiple attempts.');
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        retries++;
      }
    }
    
    throw new APIError('Maximum retry attempts exceeded.');
  },

  // Get available voices
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/tts/voices`);
      
      if (!response.ok) {
        throw new APIError(`Failed to fetch voices: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      // Return default voices as fallback
      console.warn('Failed to fetch voices from API, using defaults:', error);
      return [
        { id: 'default', name: 'Default Voice', language: 'en-US', gender: 'neutral' },
      ];
    }
  },
};