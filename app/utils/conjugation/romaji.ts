import type { ConjugationRule } from './types';

const verbClasses = [
  {
    name: 'suru',
    test: (word: string) => word === 'suru',
    conjugate: (word: string, tense: string) => {
      const forms = {
        'simple-present': 'suru',
        'present-continuous': 'shiteiru',
        'simple-past': 'shita',
        'past-continuous': 'shiteita',
        'present-perfect': 'shitearu',
        'future': 'surutsumori',
        'imperative': 'shiro',
        'polite-imperative': 'shitekudasai',
        'potential': 'dekiru',
        'conditional': 'sureba',
        'passive': 'sareru',
        'causative': 'saseru'
      };
      return forms[tense] || word;
    }
  },
  {
    name: 'kuru',
    test: (word: string) => word === 'kuru',
    conjugate: (word: string, tense: string) => {
      const forms = {
        'simple-present': 'kuru',
        'present-continuous': 'kiteiru',
        'simple-past': 'kita',
        'past-continuous': 'kiteita',
        'present-perfect': 'kitearu',
        'future': 'kurutsumori',
        'imperative': 'koi',
        'polite-imperative': 'kitekudasai',
        'potential': 'korareru',
        'conditional': 'kureba',
        'passive': 'korareru',
        'causative': 'kosaseru'
      };
      return forms[tense] || word;
    }
  },
  {
    name: 'ru-verb',
    test: (word: string) => word.endsWith('ru'),
    conjugate: (word: string, tense: string) => {
      const stem = word.slice(0, -2);
      const forms = {
        'simple-present': word,
        'present-continuous': `${stem}teiru`,
        'simple-past': `${stem}ta`,
        'past-continuous': `${stem}teita`,
        'present-perfect': `${stem}tearu`,
        'future': `${word}tsumori`,
        'imperative': `${stem}ro`,
        'polite-imperative': `${stem}tekudasai`,
        'potential': `${stem}rareru`,
        'conditional': `${stem}reba`,
        'passive': `${stem}rareru`,
        'causative': `${stem}saseru`
      };
      return forms[tense] || word;
    }
  }
];

export const romajiRules: ConjugationRule = {
  nonVerbs: ['watashi', 'wa', 'wo', 'ni', 'de', 'he', 'no', 'ga', 'mo', 'kore', 'shigoto', 'kudasai'],
  verbClasses
}; 