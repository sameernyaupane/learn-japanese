import { JMdictEntry } from '~/types/jmdict';
import { getJapaneseAudioUrl } from '~/utils/text-to-speech.server';
import { parsePartOfSpeech } from '~/utils/jmdict-utils';
import { getFirstSenseImageUrl } from '~/utils/jmdict-image-search.server';

export async function presentEntries(entriesResult: any[]): Promise<JMdictEntry[]> {
  // Process all entries in parallel
  return Promise.all(entriesResult.map(async (entry) => {
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

    return {
      ...entry,
      imageUrl,
      primaryKanji,
      primaryKana,
      romaji: (entry.kana_elements || [])[0]?.romaji,
      priority: (entry.kana_elements || [])[0]?.pri?.[0],
      audioUrl: await getJapaneseAudioUrl(primaryKana),
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
      })) || []
    };
  }));
} 