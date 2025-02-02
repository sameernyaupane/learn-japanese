declare module '~/types/jmdict' {
  export interface JMdictEntry {
    id: number;
    ent_seq: number;
    kanji_elements: JMdictKanjiElement[];
    kana_elements: JMdictKanaElement[];
    senses: JMdictSense[];
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
    lsource?: JMdictLSource[];
    glosses: JMdictGloss[];
    examples?: JMdictExample[];
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
    id: number;
    source?: string;
    text: string;
    sentences: JMdictSentence[];
  }

  export interface JMdictSentence {
    lang: string;
    text: string;
  }

  export interface JMdictLSource {
    '@_xml:lang'?: string;
    '@_ls_type'?: string;
    '@_ls_wasei'?: string;
    '#text'?: string;
  }

  export interface JMdictGloss {
    id: number;
    gloss: string;
    lang: string;
    g_gend?: string;
    g_type?: string;
  }
}