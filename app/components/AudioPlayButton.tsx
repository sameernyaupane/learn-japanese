import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function AudioPlayButton({
  audioUrl,
  currentAudio,
  setCurrentAudio,
  hoverTimeout,
  setHoverTimeout
}: {
  audioUrl: string;
  currentAudio: HTMLAudioElement | null;
  setCurrentAudio: (audio: HTMLAudioElement | null) => void;
  hoverTimeout: NodeJS.Timeout | null;
  setHoverTimeout: (timeout: NodeJS.Timeout | null) => void;
}) {
  const handleAudioPlay = () => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const newAudio = new Audio(audioUrl);
    setCurrentAudio(newAudio);
    newAudio.play();
  };

  return (
    <button
      onClick={handleAudioPlay}
      onMouseEnter={() => {
        const timeout = setTimeout(() => {
          handleAudioPlay();
        }, 500);
        setHoverTimeout(timeout);
      }}
      onMouseLeave={() => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          setHoverTimeout(null);
        }
      }}
      className="p-1 text-gray-400 hover:text-blue-600"
    >
      <SpeakerWaveIcon className="h-4 w-4" />
    </button>
  );
} 