export type Language = 'english' | 'japanese' | 'japanese_romaji' | 'nepali';

export interface Word {
  id: number;
  english_text: string;
}

export interface Translation {
  id: number;
  word_id: number;
  language: Language;
  text: string;
}

export interface Phrase {
  id: number;
  order_number: number;
  words: {
    word_id: number;
    position: number;
    translations: Record<Language, string>;
  }[];
} 