import { JMdictEntry } from '~/types/jmdict';
import { getJapaneseAudioUrl } from '~/utils/text-to-speech.server';
import { parsePartOfSpeech } from '~/utils/jmdict-utils';
import { getFirstSenseImageUrl } from '~/utils/jmdict-image-search.server';
import { FREQUENCY_RANK, FREQUENCY_LABELS } from '~/utils/frequency-ranks';

export async function presentEntries(entriesResult: any[]): Promise<JMdictEntry[]> {
  // Process all entries in parallel
  return Promise.all(entriesResult.map(async (entry) => {
    // Calculate both code and label
    const frequencyCode = calculateFrequency(entry);
    const frequencyLabel = FREQUENCY_LABELS[frequencyCode] || 'Less Common';
    
    // Start image fetch early in the process
    const imagePromise = getFirstSenseImageUrl(entry);
    
    // Process other fields while image loads
    const primaryKanji = entry.kanji_elements?.[0]?.keb || '';
    const primaryKana = entry.kana_elements?.[0]?.reb || '';
    
    // Await both image and audio together
    const [imageUrl] = await Promise.all([
      imagePromise,
      // Add other async calls here if needed
    ]);

    // Get audio URL with proper parameters
    const audioUrl = entry.ent_seq 
      ? await getJapaneseAudioUrl(primaryKana, entry.ent_seq)
      : null;

    return {
      ...entry,
      frequency: frequencyCode,
      frequencyLabel,
      imageUrl,
      primaryKanji,
      primaryKana,
      romaji: (entry.kana_elements || [])[0]?.romaji,
      priority: (entry.kana_elements || [])[0]?.pri?.[0],
      audioUrl,  // Use the properly fetched URL
      kanji_elements: entry.kanji_elements || [],
      kana_elements: entry.kana_elements || [],
      furigana: (entry.furigana || []).sort((a, b) => {
        const text = (entry.kanji_elements || [])[0]?.keb || '';
        return text.indexOf(a.ruby) - text.indexOf(b.ruby);
      }).map(f => ({
        ruby: f.ruby,
        rt: f.rt || ''
      })),
      senses: entry.senses?.map(sense => ({
        ...sense,
        pos: (sense.pos || []).map(parsePartOfSpeech),
        field: sense.field || [],
        misc: sense.misc || [],
        dial: sense.dial || [],
        stagk: sense.stagk || [],
        stagr: sense.stagr || [],
        xref: sense.xref || [],
        ant: sense.ant || [],
        lsource: sense.lsource || [],
        glosses: sense.glosses || [],
        examples: sense.examples || []
      })) || [],
      isInList: entry.is_in_list,
    };
  }));
}

function calculateFrequency(entry: any): string {
  const allPris = [
    ...(entry.kanji_elements || []).flatMap((k: any) => k.pri || []),
    ...(entry.kana_elements || []).flatMap((k: any) => k.pri || [])
  ];
  
  const highestRank = Math.min(
    ...allPris.map((p: string) => FREQUENCY_RANK[p.toLowerCase()] || Infinity)
  );
  
  return Object.keys(FREQUENCY_RANK).find(key => 
    FREQUENCY_RANK[key] === highestRank
  ) || 'uncommon';
} 

export interface JMdictEntry {
  // ... existing properties ...
  frequency?: string;
  frequencyLabel?: string;
  isInList: boolean;
} 