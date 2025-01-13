import type { ConjugationRule } from './types';

const verbClasses = [
  {
    name: 'जानु',
    test: (word: string) => word === 'जान्छु' || word === 'जान्',
    conjugate: (word: string, tense: string, context?: { prevWords?: string[] }) => {
      const isFirstPerson = context?.prevWords?.includes('म');
      console.log(`Conjugating '${word}' in tense '${tense}', isFirstPerson: ${isFirstPerson}`);
      
      const forms = {
        'simple-present': isFirstPerson ? 'जान्छु' : 'जान्छ',
        'present-continuous': 'जाँदैछु',
        'present-perfect': 'गएको छु',
        'simple-past': isFirstPerson ? 'गएँ' : 'गयो',
        'past-continuous': 'जाँदै थिएँ',
        'past-perfect': 'गएको थिएँ',
        'simple-future': 'जानेछु',
        'future-perfect': 'गइसकेको हुनेछु',
        'imperative': 'जाऊ',
        'polite-imperative': 'जानुहोस्',
        'potential': 'जान सक्छु',
        'conditional': 'जान्थें',
        'passive': 'जाइन्छ',
        'causative': 'जान लगाउँछु'
      };
      const result = forms[tense] || word;
      console.log(`Conjugation result: ${result}`);
      return result;
    }
  },
  {
    name: 'छु-verb',
    test: (word: string) => {
      const result = word.endsWith('छु');
      console.log(`Testing if '${word}' is a छु-verb: ${result}`);
      return result;
    },
    conjugate: (word: string, tense: string, context?: { prevWords?: string[] }) => {
      const isFirstPerson = context?.prevWords?.includes('म');
      const stem = word.replace(/छु$/, '');
      console.log(`Conjugating छु-verb '${word}', stem: '${stem}', tense: '${tense}', isFirstPerson: ${isFirstPerson}`);
      
      const forms = {
        'simple-present': isFirstPerson ? word : `${stem}छ`,
        'present-continuous': `${stem}दैछु`,
        'simple-past': isFirstPerson ? `${stem}एँ` : `${stem}यो`,
        'past-continuous': `${stem}दै थिएँ`,
        'present-perfect': `${stem}एको छु`,
        'future': `${stem}नेछु`,
        'imperative': `${stem}`,
        'polite-imperative': `${stem}नुहोस्`,
        'potential': `${stem}न सक्छु`,
        'conditional': `${stem}न्थें`,
        'passive': `${stem}इन्छ`,
        'causative': `${stem}न लगाउँछु`
      };
      const result = forms[tense] || word;
      console.log(`Conjugation result: ${result}`);
      return result;
    }
  }
];

export const nepaliRules: ConjugationRule = {
  nonVerbs: ['म', 'मा', 'यो', 'काम', 'होस्'],
  verbClasses
}; 