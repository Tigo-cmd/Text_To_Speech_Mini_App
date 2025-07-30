import React, { useState, useEffect, useCallback } from 'react';
import { Headphones, Github, Settings } from 'lucide-react';
import { TextToSpeechForm } from './components/TextToSpeechForm';
import { AudioPlayer } from './components/AudioPlayer';
import { ErrorMessage } from './components/ErrorMessage';
import { ThemeToggle } from './components/ThemeToggle';
import { ttsAPI } from './services/api';
import { Voice, TTSStatus } from './types/tts';

function App() {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');

  // Load voices on component mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const fetchedVoices = await ttsAPI.getVoices();
        setVoices(fetchedVoices);
      } catch (error) {
        console.warn('Failed to load voices:', error);
        // Use default voice as fallback
        setVoices([
          { id: 'default', name: 'Default Voice', language: 'en-US', gender: 'neutral' },
        ]);
      }
    };

    loadVoices();
  }, []);

  const handleTextSubmit = useCallback(async (text: string, voice: string) => {
    setStatus('submitting');
    setError('');
    setAudioBlob(null);

    try {
      // Submit text for conversion
      const response = await ttsAPI.convertText({
        text,
        voice: voice !== 'default' ? voice : undefined,
        format: 'mp3',
      });

      setStatus('processing');

      // Poll for audio result
      const audioBlob = await ttsAPI.getAudio(response.taskId);
      
      setAudioBlob(audioBlob);
      setStatus('completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setStatus('error');
    }
  }, []);

  const handleRetry = useCallback(() => {
    setStatus('idle');
    setError('');
  }, []);

  const handleDismissError = useCallback(() => {
    setError('');
    if (status === 'error') {
      setStatus('idle');
    }
  }, [status]);

  const handleAudioError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                aria-label="View source code"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Headphones size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Text to Speech
            </h1>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your text into natural-sounding speech with advanced AI voices. 
            Choose from a variety of voices and languages, and enjoy seamless audio playback.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2">
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configuration
              </h2>
            </div>
            
            <TextToSpeechForm
              onSubmit={handleTextSubmit}
              voices={voices}
              status={status}
              characterLimit={5000}
            />

            {/* Error Display */}
            {error && (
              <div className="mt-6">
                <ErrorMessage
                  message={error}
                  onDismiss={handleDismissError}
                  onRetry={status === 'error' ? handleRetry : undefined}
                />
              </div>
            )}
          </div>

          {/* Audio Player Section */}
          <div className="space-y-6">
            <AudioPlayer audioBlob={audioBlob} onError={handleAudioError} />
            
            {/* Instructions */}
            {!audioBlob && status === 'idle' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  How to Use
                </h3>
                <ol className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </span>
                    Enter the text you want to convert to speech
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </span>
                    Choose your preferred voice from the dropdown
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </span>
                    Click "Convert to Speech\" and wait for processing
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </span>
                    Play, control, and download your generated audio
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
          <p>Built with React, TypeScript, TigoSofts technologies</p>
        </footer>
      </div>
    </div>
  );
}

export default App;