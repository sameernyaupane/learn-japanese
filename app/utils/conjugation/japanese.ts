import type { ConjugationRule } from './types';

const verbClasses = [
  {
    name: 'する',
    test: (word: string) => word === 'する',
    conjugate: (word: string, tense: string) => {
      const forms = {
        'simple-present': 'する',
        'present-continuous': 'している',
        'present-perfect': 'してある',
        'simple-past': 'した',
        'past-continuous': 'していた',
        'past-perfect': 'してしまった',
        'simple-future': 'するつもり',
        'future-perfect': 'してしまうつもり',
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
        'simple-present': 'くる',
        'present-continuous': 'きている',
        'present-perfect': 'きてある',
        'simple-past': 'きた',
        'past-continuous': 'きていた',
        'past-perfect': 'きてしまった',
        'simple-future': 'くるつもり',
        'future-perfect': 'きてしまうつもり',
        'imperative': 'こい',
        'polite-imperative': 'きてください',
        'potential': 'こられる',
        'conditional': 'くれば',
        'passive': 'こられる',
        'causative': 'こさせる'
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
        'present-perfect': `${stem}てある`,
        'simple-past': `${stem}た`,
        'past-continuous': `${stem}ていた`,
        'past-perfect': `${stem}てしまった`,
        'simple-future': `${word}つもり`,
        'future-perfect': `${stem}てしまうつもり`,
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