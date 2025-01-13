import type { ConjugationRule } from './types';

const verbClasses = [
  {
    name: 'する',
    test: (word: string) => word === 'する',
    conjugate: (word: string, tense: string) => {
      const forms = {
        'simple-present': 'する',
        'present-continuous': 'している',
        'simple-past': 'した',
        'past-continuous': 'していた',
        'present-perfect': 'してある',
        'future': 'するつもり',
        'imperative': 'しろ',
        'polite-imperative': 'してください',
        'potential': 'できる',
        'conditional': 'すれば',
        'passive': 'される',
        'causative': 'させる'
      };
      return forms[tense] || word;
    }
  },
  {
    name: 'くる',
    test: (word: string) => word === 'くる',
    conjugate: (word: string, tense: string) => {
      const forms = {
        'plain-present': 'くる',
        'polite-present': 'きます',
        'te': 'きて',
        'polite-past': 'きました'
      };
      return forms[tense] || word;
    }
  },
  {
    name: 'る-verb',
    test: (word: string) => word.endsWith('る'),
    conjugate: (word: string, tense: string) => {
      const stem = word.slice(0, -1);
      const forms = {
        'simple-present': word,
        'present-continuous': `${stem}ている`,
        'simple-past': `${stem}た`,
        'past-continuous': `${stem}ていた`,
        'present-perfect': `${stem}てある`,
        'future': `${stem}るつもり`,
        'imperative': `${stem}ろ`,
        'polite-imperative': `${stem}てください`,
        'potential': `${stem}られる`,
        'conditional': `${stem}れば`,
        'passive': `${stem}られる`,
        'causative': `${stem}させる`
      };
      return forms[tense] || word;
    }
  }
];

export const japaneseRules: ConjugationRule = {
  nonVerbs: ['私', 'は', 'を', 'に', 'で', 'へ', 'の', 'が', 'も', 'これ', '仕事', 'ください'],
  verbClasses
}; 