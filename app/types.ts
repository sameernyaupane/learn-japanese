export interface WordWithForm {
  base: string;
  form: string;
}

export type Word = string | WordWithForm;

export interface PhraseTranslations {
  japanese: Word[];
  japanese_romaji: Word[];
  nepali: Word[];
  english: Word[];
}

export interface PhraseWithTranslations {
  id: number;
  order_number: number;
  english_text: string;
  translations: PhraseTranslations;
} 