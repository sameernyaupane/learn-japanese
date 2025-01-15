CREATE TABLE IF NOT EXISTS sentences (
  id SERIAL PRIMARY KEY,
  english_text TEXT NOT NULL UNIQUE,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  english_text TEXT NOT NULL UNIQUE,
  word_type TEXT
);

CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  word_id INTEGER REFERENCES words(id),
  language TEXT NOT NULL,
  text TEXT NOT NULL,
  UNIQUE(word_id, language)
);

CREATE TABLE IF NOT EXISTS phrases (
  id SERIAL PRIMARY KEY,
  order_number INTEGER NOT NULL,
  sentence_id INTEGER REFERENCES sentences(id)
);

CREATE TABLE IF NOT EXISTS phrase_words (
  id SERIAL PRIMARY KEY,
  phrase_id INTEGER REFERENCES phrases(id),
  word_id INTEGER REFERENCES words(id),
  position INTEGER NOT NULL,
  UNIQUE(phrase_id, position)
);

CREATE TABLE IF NOT EXISTS phrase_indexes (
  id SERIAL PRIMARY KEY,
  phrase_id INTEGER REFERENCES phrases(id),
  index_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  language TEXT NOT NULL,
  UNIQUE(phrase_id, language, index_number)
);

CREATE INDEX idx_translations_word_id ON translations(word_id);
CREATE INDEX idx_phrase_words_phrase_id ON phrase_words(phrase_id);
CREATE INDEX idx_phrase_indexes_phrase_id ON phrase_indexes(phrase_id);