import { KanjiHeader } from './KanjiHeader';
import { RomajiRow } from './RomajiRow';
import { SenseGroup } from './SenseGroup';
import { RelatedTerms } from './RelatedTerms';
import { AudioPlayButton } from './AudioPlayButton';
import { FrequencyBadge } from './FrequencyBadge';
import { useUser } from '~/utils/auth';
import { Form } from '@remix-run/react';

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
  const user = useUser();
  
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 relative">
      <ListControls entry={entry} userId={user?.id} />
      {entry.imageUrl && (
        <div className="w-full h-56 bg-gray-50 overflow-hidden border-b border-gray-100 rounded-t-xl">
          <img 
            src={entry.imageUrl}
            alt={entry.senses[0]?.glosses[0]?.text || "Vocabulary illustration"}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <KanjiHeader
              primaryKana={entry.primaryKana}
              primaryKanji={entry.primaryKanji}
              priority={entry.priority}
              furigana={entry.furigana}
            />
          </div>
          <RomajiRow romaji={entry.romaji}>
            {entry.audioUrl && (
              <AudioPlayButton
                audioUrl={entry.audioUrl}
                currentAudio={currentAudio}
                setCurrentAudio={setCurrentAudio}
                hoverTimeout={hoverTimeout}
                setHoverTimeout={setHoverTimeout}
              />
            )}
          </RomajiRow>
        </div>

        <div className="mb-4 space-y-3">
          {entry.frequency && (
              <FrequencyBadge code={entry.frequency} label={entry.frequencyLabel} />
            )}
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

function ListControls({ entry, userId }: { entry: any; userId?: string }) {
  if (!userId) return null;

  const isInList = entry.isInList; // This should come from your presenter

  return (
    <Form method="post" className="absolute top-2 right-2">
      <input type="hidden" name="entSeq" value={entry.ent_seq} />
      {isInList ? (
        <button
          name="_action"
          value="removeFromList"
          className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
          title="Remove from list"
        >
          ★
        </button>
      ) : (
        <button
          name="_action"
          value="addToList"
          className="p-1.5 bg-gray-100 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
          title="Add to list"
        >
          ☆
        </button>
      )}
    </Form>
  );
} 