import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

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
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const [audioFinished, setAudioFinished] = useState(true);

  useEffect(() => {
    if (!currentAudio) return;

    const handleAudioEnd = () => setAudioFinished(true);
    currentAudio.addEventListener('ended', handleAudioEnd);
    
    return () => {
      currentAudio.removeEventListener('ended', handleAudioEnd);
    };
  }, [currentAudio]);

  const handleAudioPlay = () => {
    setHasBeenClicked(true);
    setAudioFinished(false);
    
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
        if (!hasBeenClicked || !audioFinished) return;
        
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