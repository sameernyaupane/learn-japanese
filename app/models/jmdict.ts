import { sql } from '~/utils/db.server';
import { getJapaneseAudioUrl } from '~/utils/text-to-speech.server';

export interface JMdictEntry {
  id: number;
  ent_seq: number;
  kanji_elements: Array<{
    id: number;
    keb: string;
    pri: string[];
  }>;
  kana_elements: Array<{
    id: number;
    reb: string;
    pri: string[];
    romaji: string;
    audio?: string;
  }>;
  senses: Array<{
    id: number;
    pos: string[];
    field: string[];
    misc: string[];
    dial: string[];
    glosses: Array<{
      id: number;
      gloss: string;
      lang: string;
    }>;
    examples: Array<{
      id: number;
      text: string;
      translation: string;
      source?: string;
    }>;
  }>;
}

export interface JMdictSense {
  id: number;
  pos: string[];
  field: string[];
  misc: string[];
  dial: string[];
  stagk?: string[];
  stagr?: string[];
  xref?: string[];
  ant?: string[];
  lsource?: Array<{
    lang: string;
    text: string;
    type?: string;
  }>;
  glosses: Array<{
    id: number;
    gloss: string;
    lang: string;
    g_gend?: string;
    g_type?: string;
  }>;
  examples?: Array<{
    id: number;
    source?: string;
    text: string;
    sentences: Array<{
      lang: string;
      text: string;
    }>;
  }>;
}

export interface JMdictKanjiElement {
  id: number;
  keb: string;
  ke_inf?: string[];
  ke_pri?: string[];
}

export interface JMdictKanaElement {
  id: number;
  reb: string;
  romaji: string;
  re_inf?: string[];
  re_pri?: string[];
  re_restr?: string[];
  re_nokanji?: boolean;
  audio?: string;
}

export interface JMdictExample {
  source: string;
  text: string;
  sentences: Array<{
    lang: string;
    text: string;
  }>;
}

export async function getEntries(page: number = 1, perPage: number = 50): Promise<{ entries: JMdictEntry[], totalEntries: number }> {
  const offset = (page - 1) * perPage;
  
  const [entriesResult, countResult] = await Promise.all([
    sql`
      SELECT
        e.id,
        e.ent_seq,
        (
          SELECT json_agg(json_build_object(
            'id', ke.id,
            'keb', ke.keb,
            'pri', ke.pri
          ))
          FROM kanji_elements ke
          WHERE ke.entry_id = e.id
        ) as kanji_elements,
        (
          SELECT json_agg(json_build_object(
            'id', ka.id,
            'reb', ka.reb,
            'pri', ka.pri,
            'romaji', ka.romaji
          ))
          FROM kana_elements ka
          WHERE ka.entry_id = e.id
        ) as kana_elements,
        (
          SELECT json_agg(json_build_object(
            'id', s.id,
            'stagk', s.stagk,
            'stagr', s.stagr,
            'pos', s.pos,
            'xref', s.xref,
            'ant', s.ant,
            'field', s.field,
            'misc', s.misc,
            'dial', s.dial,
            'lsource', s.lsource,
            'glosses', (
              SELECT json_agg(json_build_object(
                'id', g.id,
                'gloss', g.gloss,
                'lang', g.lang,
                'g_gend', g.g_gend,
                'g_type', g.g_type
              ))
              FROM glosses g
              WHERE g.sense_id = s.id
            ),
            'examples', (
              SELECT json_agg(json_build_object(
                'id', ex.id,
                'source', ex.source,
                'text', ex.text,
                'sentences', (
                  SELECT json_agg(json_build_object(
                    'lang', exs.lang,
                    'text', exs.text
                  ))
                  FROM example_sentences exs
                  WHERE exs.example_id = ex.id
                )
              ))
              FROM examples ex
              WHERE ex.sense_id = s.id
            )
          ))
          FROM senses s
          WHERE s.entry_id = e.id
        ) as senses
      FROM jmdict_entries e
      ORDER BY e.ent_seq ASC
      LIMIT ${perPage}
      OFFSET ${offset}
    `,
    sql`SELECT COUNT(*) FROM jmdict_entries`
  ]);

  const totalEntries = Number(countResult[0].count);
  
  const parsePartOfSpeech = (pos: string) => {
    const POS_MAP: { [key: string]: string } = {
      '&n;': 'Noun',
      '&adj-i;': 'い-adjective',
      '&adj-na;': 'な-adjective',
      '&v5k;': 'Godan verb (ku)',
      '&unc;': 'Unclassified',
      '&exp;': 'Expression',
      '&id;': 'Idiomatic',
      '&adv;': 'Adverb',
      '&prt;': 'Particle',
      '&ctr;': 'Counter',
      '&vs;': 'Suru verb',
      '&pref;': 'Prefix',
      '&suf;': 'Suffix',
      '&int;': 'Interjection'
    };
    return POS_MAP[pos] || pos.replace(/^&|;$/g, '');
  };

  const entries = await Promise.all(entriesResult.map(async (entry) => ({
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

  return { entries, totalEntries };
} 