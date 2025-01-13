import type { ConjugationRule } from './types';

const verbClasses = [
  {
    name: 'regular-verb',
    test: (word: string) => true,
    conjugate: (word: string, tense: string) => {
      const forms = {
        'simple-present': word,
        'present-continuous': `${word}ing`,
        'simple-past': `${word}ed`,
        'past-continuous': `was ${word}ing`,
        'present-perfect': `have ${word}ed`,
        'future': `will ${word}`,
        'imperative': word,
        'polite-imperative': `please ${word}`,
        'potential': `can ${word}`,
        'conditional': `would ${word}`,
        'passive': `is ${word}ed`,
        'causative': `make ${word}`
      };
      return forms[tense] || word;
    }
  },
  {
    name: 'irregular-verb',
    test: (word: string) => ['go', 'do', 'make', 'take', 'get'].includes(word),
    conjugate: (word: string, tense: string) => {
      const irregularPast = {
        'go': 'went',
        'do': 'did',
        'make': 'made',
        'take': 'took',
        'get': 'got'
      };
      const irregularPerfect = {
        'go': 'gone',
        'do': 'done',
        'make': 'made',
        'take': 'taken',
        'get': 'gotten'
      };

      const forms = {
        'simple-present': word,
        'present-continuous': `${word}ing`,
        'present-perfect': `have ${irregularPerfect[word] || `${word}ed`}`,
        'simple-past': irregularPast[word] || `${word}ed`,
        'past-continuous': `was ${word}ing`,
        'past-perfect': `had ${irregularPerfect[word] || `${word}ed`}`,
        'simple-future': `will ${word}`,
        'future-perfect': `will have ${irregularPerfect[word] || `${word}ed`}`,
        'imperative': word,
        'polite-imperative': `please ${word}`,
        'potential': `can ${word}`,
        'conditional': `would ${word}`,
        'passive': `is ${irregularPerfect[word] || `${word}ed`}`,
        'causative': `make ${word}`
      };
      return forms[tense] || word;
    }
  }
];

export const englishRules: ConjugationRule = {
  nonVerbs: ['I', 'this', 'to', 'at', 'the', 'work', 'please', 'that', 'when', 'will', 'many', 'home'],
  verbClasses
}; 