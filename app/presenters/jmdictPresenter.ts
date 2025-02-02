import { JMdictEntry } from '~/types/jmdict';
import { getJapaneseAudioUrl } from '~/utils/text-to-speech.server';

export async function presentEntries(entriesResult: any[]): Promise<JMdictEntry[]> {
  const parsePartOfSpeech = (pos: string) => {
    const POS_MAP: { [key: string]: string } = {
      '&adj-i;': 'Adjective (keiyoushi)',
      '&adj-ix;': 'Adjective (yoi/ii)',
      '&adj-na;': 'Adjectival noun',
      '&adj-no;': 'Noun acting as adjective',
      '&adj-pn;': 'Pre-noun adjectival',
      '&adj-t;': 'Taru adjective',
      '&adj-f;': 'Noun acting as adjective (formal)',
      '&adv;': 'Adverb',
      '&adv-to;': 'Adverb taking "to"',
      '&aux;': 'Auxiliary',
      '&aux-adj;': 'Auxiliary adjective',
      '&aux-v;': 'Auxiliary verb',
      '&conj;': 'Conjunction',
      '&cop;': 'Copula',
      '&ctr;': 'Counter',
      '&exp;': 'Expression',
      '&int;': 'Interjection',
      '&n;': 'Noun',
      '&n-adv;': 'Adverbial noun',
      '&n-pr;': 'Proper noun',
      '&n-pref;': 'Noun prefix',
      '&n-suf;': 'Noun suffix',
      '&n-t;': 'Temporal noun',
      '&num;': 'Numeral',
      '&pn;': 'Pronoun',
      '&pref;': 'Prefix',
      '&prt;': 'Particle',
      '&suf;': 'Suffix',
      '&unc;': 'Unclassified',
      '&v-unspec;': 'Verb (unspecified type)',
      '&v1;': 'Ichidan verb',
      '&v1-s;': 'Ichidan verb - kureru special class',
      '&v2a-s;': 'Nidan verb (archaic)',
      '&v4h;': 'Yondan verb with "hu/fu" ending (archaic)',
      '&v4r;': 'Yondan verb with "ru" ending (archaic)',
      '&v5aru;': 'Godan verb - -aru special class',
      '&v5b;': 'Godan verb - bu',
      '&v5g;': 'Godan verb - gu',
      '&v5k;': 'Godan verb - ku',
      '&v5k-s;': 'Godan verb - iku/yuku special class',
      '&v5m;': 'Godan verb - mu',
      '&v5n;': 'Godan verb - nu',
      '&v5r;': 'Godan verb - ru',
      '&v5r-i;': 'Godan verb - ru (irregular)',
      '&v5s;': 'Godan verb - su',
      '&v5t;': 'Godan verb - tsu',
      '&v5u;': 'Godan verb - u',
      '&v5u-s;': 'Godan verb - u (special class)',
      '&v5uru;': 'Godan verb - uru (old form of eru)',
      '&vi;': 'Intransitive verb',
      '&vk;': 'Kuru verb - special class',
      '&vn;': 'Irregular nu verb',
      '&vr;': 'Irregular ru verb',
      '&vs;': 'Suru verb',
      '&vs-c;': 'Su verb - precursor to the modern suru',
      '&vs-s;': 'Suru verb - special class',
      '&vs-i;': 'Suru verb - irregular',
      '&vt;': 'Transitive verb',
      '&vu;': 'U verb (old form)',
      '&vr-z;': 'Zuru verb (alternative form of -jiru verbs)'
    };
    return POS_MAP[pos] || pos.replace(/^&|;$/g, '');
  };

  return Promise.all(entriesResult.map(async (entry) => ({
    ...entry,
    kanji_elements: entry.kanji_elements || [],
    kana_elements: await Promise.all((entry.kana_elements || []).map(async (kana) => ({
      ...kana,
      audio: await getJapaneseAudioUrl(kana.reb)
    }))),
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
  })));
} 