export const TENSES = [
  { value: 'simple-present', label: 'Simple Present' },
  { value: 'present-continuous', label: 'Present Continuous' },
  { value: 'present-perfect', label: 'Present Perfect' },
  { value: 'simple-past', label: 'Simple Past' },
  { value: 'past-continuous', label: 'Past Continuous' },
  { value: 'past-perfect', label: 'Past Perfect' },
  { value: 'simple-future', label: 'Simple Future' },
  { value: 'future-perfect', label: 'Future Perfect' },
  { value: 'imperative', label: 'Imperative' },
  { value: 'polite-imperative', label: 'Polite Imperative' },
  { value: 'potential', label: 'Potential' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'passive', label: 'Passive' },
  { value: 'causative', label: 'Causative' }
] as const;

export type Tense = typeof TENSES[number]['value']; 