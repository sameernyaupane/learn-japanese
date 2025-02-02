import { KanjiHeader } from './KanjiHeader';
import { RomajiRow } from './RomajiRow';
import { SenseGroup } from './SenseGroup';
import { RelatedTerms } from './RelatedTerms';
import { AudioPlayButton } from './AudioPlayButton';

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

  return (
    <div 
      key={entry.id} 
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100"
    >
      <div className="p-4">
        <div className="mb-4 space-y-2">
          <KanjiHeader
            primaryKana={primaryKana}
            primaryKanji={primaryKanji}
            priority={priority}
          />
          <RomajiRow romaji={romaji}>
            {audioUrl && (
              <AudioPlayButton
                audioUrl={audioUrl}
                currentAudio={currentAudio}
                setCurrentAudio={setCurrentAudio}
                hoverTimeout={hoverTimeout}
                setHoverTimeout={setHoverTimeout}
              />
            )}
          </RomajiRow>
        </div>

        <div className="space-y-3">
          {entry.senses.map((sense: any, senseIndex: number) => (
            <div key={sense.id} className="text-sm">
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
                  <SenseGroup
                    key={groupIndex}
                    group={group}
                    pos={sense.pos}
                  />
                ))}
              </div>

              {sense.xref && senseIndex === entry.senses.length - 1 && (
                <RelatedTerms xref={sense.xref} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 