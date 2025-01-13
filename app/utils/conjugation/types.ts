export type Language = 'japanese' | 'japanese_romaji' | 'english' | 'nepali';

export type VerbClass = {
  name: string;
  test: (word: string) => boolean;
  conjugate: (word: string, tense: string, context?: { prevWords?: string[] }) => string;
};

export type ConjugationRule = {
  nonVerbs: string[];
  verbClasses: VerbClass[];
};

export type Tense = 
  | 'simple-present'
  | 'present-continuous'
  | 'present-perfect'
  | 'simple-past'
  | 'past-continuous'
  | 'past-perfect'
  | 'simple-future'; 