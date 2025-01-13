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
  },
  {
    name: 'いく',
    test: (word: string) => word === 'いく' || word === 'いきます' || word === '行く' || word === '行きます',
    conjugate: (word: string, tense: string) => {
      const isPolite = word === 'いきます' || word === '行きます';
      const useKanji = word.includes('行');
      const forms = {
        'simple-present': isPolite ? (useKanji ? '行きます' : 'いきます') : (useKanji ? '行く' : 'いく'),
        'present-continuous': isPolite ? (useKanji ? '行っています' : 'いっています') : (useKanji ? '行っている' : 'いっている'),
        'present-perfect': isPolite ? (useKanji ? '行ってきました' : 'いってきました') : (useKanji ? '行ってきた' : 'いってきた'),
        'simple-past': isPolite ? (useKanji ? '行きました' : 'いきました') : (useKanji ? '行った' : 'いった'),
        'past-continuous': isPolite ? (useKanji ? '行っていました' : 'いっていました') : (useKanji ? '行っていた' : 'いっていた'),
        'past-perfect': isPolite ? (useKanji ? '行ってしまいました' : 'いってしまいました') : (useKanji ? '行ってしまった' : 'いってしまった'),
        'simple-future': isPolite ? (useKanji ? '行きます' : 'いきます') : (useKanji ? '行く' : 'いく'),
        'future-perfect': isPolite ? (useKanji ? '行っています' : 'いっています') : (useKanji ? '行っている' : 'いっている'),
        'imperative': isPolite ? (useKanji ? '行ってください' : 'いってください') : (useKanji ? '行け' : 'いけ'),
        'polite-imperative': useKanji ? '行ってください' : 'いってください',
        'potential': isPolite ? (useKanji ? '行けます' : 'いけます') : (useKanji ? '行ける' : 'いける'),
        'conditional': isPolite ? (useKanji ? '行きましたら' : 'いきましたら') : (useKanji ? '行けば' : 'いけば'),
        'passive': isPolite ? (useKanji ? '行かれます' : 'いかれます') : (useKanji ? '行かれる' : 'いかれる'),
        'causative': isPolite ? (useKanji ? '行かせます' : 'いかせます') : (useKanji ? '行かせる' : 'いかせる'),
        'desiderative': isPolite ? (useKanji ? '行きたいです' : 'いきたいです') : (useKanji ? '行きたい' : 'いきたい'),
        'causative': isPolite ? (useKanji ? '行かせます' : 'いかせます') : (useKanji ? '行かせる' : 'いかせる')
      };
      return forms[tense] || word;
    }
  }
];

export const japaneseRules: ConjugationRule = {
  nonVerbs: ['私', 'は', 'を', 'に', 'で', 'へ', 'の', 'が', 'も', 'これ', '仕事', 'ください'],
  verbClasses
}; 