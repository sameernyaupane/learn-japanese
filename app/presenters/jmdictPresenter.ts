import { JMdictEntry } from '~/types/jmdict';
import { getJapaneseAudioUrl } from '~/utils/text-to-speech.server';
import { parsePartOfSpeech } from '~/utils/jmdict-utils';
import { getFirstSenseImageUrl } from '~/utils/jmdict-image-search.server';

export async function presentEntries(entriesResult: any[]): Promise<JMdictEntry[]> {
  return Promise.all(entriesResult.map(async (entry) => {
    const primaryKanji = (entry.kanji_elements || [])[0]?.keb;
    const primaryKana = (entry.kana_elements || [])[0]?.reb;
    
    const presentedEntry = {
      ...entry,
      primaryKanji,
      primaryKana,
      romaji: (entry.kana_elements || [])[0]?.romaji,
      priority: (entry.kana_elements || [])[0]?.pri?.[0],
      audioUrl: await getJapaneseAudioUrl(primaryKana),
      imageUrl: await getFirstSenseImageUrl(entry),
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

    return presentedEntry;
  }));
} 