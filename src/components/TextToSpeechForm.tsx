// src/components/TextToSpeechForm.tsx
import React, { useState, useEffect } from 'react';
import { MessageSquare, Mic } from 'lucide-react';
import { VoiceSelector } from './VoiceSelector';
import { LoadingSpinner } from './LoadingSpinner';
import { Voice, TTSStatus } from '../types/tts';

interface TextToSpeechFormProps {
  onSubmit: (text: string, voice: string) => void;
  voices: Voice[];
  status: TTSStatus;
  characterLimit?: number;
}

export const TextToSpeechForm: React.FC<TextToSpeechFormProps> = ({
  onSubmit,
  voices,
  status,
  characterLimit = 5000,
}) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');

  // Derive loading flag
  const isLoading = status === 'submitting' || status === 'processing';

  useEffect(() => {
    // Initialize default voice once voices arrive
    if (voices.length > 0 && !selectedVoice) {
      setSelectedVoice(voices[0].id);
    }
  }, [voices, selectedVoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow submit whenever we're not already loading
    if (!isLoading && text.trim()) {
      onSubmit(text.trim(), selectedVoice);
    }
  };

  // Disable only when no text, too long, or actively loading
  const isDisabled =
    !text.trim() ||
    text.length > characterLimit ||
    isLoading;

  const getStatusMessage = () => {
    switch (status) {
      case 'submitting':
        return 'Submitting your text...';
      case 'processing':
        return 'Converting text to speech...';
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text Input */}
      <div className="space-y-2">
        <label
          htmlFor="text-input"
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <MessageSquare size={16} />
          Enter Text to Convert
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your text here..."
          rows={6}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical min-h-[120px] transition-colors"
          maxLength={characterLimit}
        />
        <div className="flex justify-between items-center text-sm">
          <span className={text.length > characterLimit ? 'text-red-500' : 'text-gray-500'}>
            {text.length} / {characterLimit.toLocaleString()} characters
          </span>
          {text.length > characterLimit && (
            <span className="text-red-500 text-xs">Character limit exceeded</span>
          )}
        </div>
      </div>

      {/* Voice Selection */}
      {voices.length > 0 && (
        <VoiceSelector
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          disabled={isLoading}
        />
      )}

      {/* Loading Status */}
      {isLoading && <LoadingSpinner message={getStatusMessage() || undefined} />}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Mic size={18} />
        {isLoading ? 'Converting...' : 'Convert to Speech'}
      </button>
    </form>
  );
};
