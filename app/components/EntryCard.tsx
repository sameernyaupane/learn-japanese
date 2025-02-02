import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export function EntryCard({
  entry,
  currentAudio,
  setCurrentAudio,
  hoverTimeout,
  setHoverTimeout,
}: {
  entry: any;
  currentAudio: HTMLAudioElement | null;
  setCurrentAudio: (audio: HTMLAudioElement | null) => void;
  hoverTimeout: NodeJS.Timeout | null;
  setHoverTimeout: (timeout: NodeJS.Timeout | null) => void;
}) {
  const primaryKanji = entry.kanji_elements[0]?.keb;
  const primaryKana = entry.kana_elements[0]?.reb;
  const romaji = entry.kana_elements[0]?.romaji;
  const priority = entry.kana_elements[0]?.pri?.[0];
  const audioUrl = entry.kana_elements[0]?.audio;

  const handleAudioPlay = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const newAudio = new Audio(audioUrl);
    setCurrentAudio(newAudio);
    newAudio.play();
  };

  return (
    <div 
      key={entry.id} 
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100"
    >
      <div className="p-4">
        {/* Kanji Header */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600 leading-tight">
                {primaryKana}
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {primaryKanji}
              </div>
            </div>
            {priority && (
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {priority}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-sm text-gray-400">
              {romaji}
            </div>
            {audioUrl && (
              <button
                onClick={() => handleAudioPlay(audioUrl)}
                onMouseEnter={() => {
                  const timeout = setTimeout(() => {
                    handleAudioPlay(audioUrl);
                  }, 500);
                  setHoverTimeout(timeout);
                }}
                onMouseLeave={() => {
                  if (hoverTimeout) {
                    clearTimeout(hoverTimeout);
                    setHoverTimeout(null);
                  }
                  if (currentAudio) {
                    currentAudio.pause();
                  }
                }}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <SpeakerWaveIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Senses */}
        <div className="space-y-3">
          {entry.senses.map((sense: any, senseIndex: number) => (
            <div key={sense.id} className="text-sm">
              {/* Part of Speech */}
              {sense.pos?.length > 0 && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-emerald-600">
                    {sense.pos.join(', ')}
                  </span>
                  {sense.field && (
                    <span className="text-xs text-gray-400">
                      {sense.field}
                    </span>
                  )}
                </div>
              )}

              {/* Definitions */}
              <div className="space-y-2">
                {sense.glosses.reduce((acc: any[], gloss: any) => {
                  const lastGroup = acc[acc.length - 1];
                  const currentType = [gloss.g_type, gloss.g_gend].filter(Boolean).join(' ') || sense.pos?.join(', ');
                  
                  if (lastGroup && lastGroup.type === currentType) {
                    lastGroup.glosses.push(gloss);
                  } else {
                    acc.push({ type: currentType, glosses: [gloss] });
                  }
                  
                  return acc;
                }, []).map((group: any, groupIndex: number) => (
                  <div key={groupIndex} className="relative pl-3">
                    <div className="text-gray-800 leading-snug">
                      <span className="mr-2">•</span>
                      {group.glosses.map((gloss: any, i: number) => (
                        <span key={gloss.id}>
                          {gloss.gloss}
                          {i < group.glosses.length - 1 && ', '}
                        </span>
                      ))}
                      {group.type && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({group.type})
                        </span>
                      )}
                    </div>
                    {group.glosses[0]?.example && (
                      <div className="mt-2 ml-3 pl-2 border-l-2 border-gray-200 text-gray-600 text-xs italic bg-gray-50 p-1.5 rounded">
                        "{group.glosses[0].example}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Related Terms */}
              {sense.xref && senseIndex === entry.senses.length - 1 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <ArrowRightIcon className="h-3 w-3" />
                    <span>Related: {sense.xref}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 