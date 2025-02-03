CREATE TABLE IF NOT EXISTS jmdict_entries (
  id SERIAL PRIMARY KEY,
  ent_seq INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS kanji_elements (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES jmdict_entries(id),
  keb TEXT NOT NULL,
  ke_inf JSONB,
  ke_pri JSONB,
  pri JSONB,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kana_elements (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES jmdict_entries(id),
  reb TEXT NOT NULL,
  re_nokanji BOOLEAN,
  re_restr JSONB,
  re_inf JSONB,
  re_pri JSONB,
  pri JSONB,
  romaji TEXT,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS senses (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES jmdict_entries(id),
  stagk JSONB,
  stagr JSONB,
  pos JSONB,
  xref JSONB,
  ant JSONB,
  field JSONB,
  misc JSONB,
  dial JSONB,
  lsource JSONB,
  s_inf JSONB,
  glosses JSONB
);

CREATE TABLE IF NOT EXISTS glosses (
  id SERIAL PRIMARY KEY,
  sense_id INTEGER REFERENCES senses(id),
  lang TEXT,
  gloss TEXT NOT NULL,
  g_gend TEXT,
  g_type TEXT
);

CREATE TABLE IF NOT EXISTS examples (
  id SERIAL PRIMARY KEY,
  sense_id INTEGER REFERENCES senses(id),
  source JSONB,
  text TEXT NOT NULL,
  translation JSONB
);

CREATE TABLE jmdict_furigana (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES jmdict_entries(id),
  text TEXT NOT NULL,
  reading TEXT NOT NULL,
  furigana JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (text, reading)
);

CREATE TABLE jmdict_images (
  id SERIAL PRIMARY KEY,
  ent_seq INTEGER NOT NULL REFERENCES jmdict_entries(ent_seq),
  filename TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ent_seq)
);

CREATE INDEX idx_kanji_entry_id ON kanji_elements(entry_id);
CREATE INDEX idx_kana_entry_id ON kana_elements(entry_id);
CREATE INDEX idx_senses_entry_id ON senses(entry_id);
CREATE INDEX idx_glosses_sense_id ON glosses(sense_id);
CREATE INDEX idx_furigana_entry_id ON jmdict_furigana(entry_id);

CREATE INDEX idx_furigana_text ON jmdict_furigana(text);
CREATE INDEX idx_furigana_reading ON jmdict_furigana(reading);
CREATE INDEX idx_furigana_text_reading ON jmdict_furigana(text, reading);
CREATE INDEX idx_furigana_data ON jmdict_furigana USING GIN(furigana);

CREATE INDEX IF NOT EXISTS idx_kanji_position 
ON kanji_elements(keb, position);

CREATE INDEX IF NOT EXISTS idx_kana_position 
ON kana_elements(reb, position);

CREATE INDEX idx_jmdict_images_ent_seq ON jmdict_images(ent_seq);
CREATE INDEX idx_jmdict_images_filename ON jmdict_images(filename);

ALTER TABLE kanji_elements
ADD COLUMN ke_inf JSONB,
ADD COLUMN ke_pri JSONB;

ALTER TABLE kana_elements
ADD COLUMN re_inf JSONB,
ADD COLUMN re_pri JSONB,
ADD COLUMN re_restr JSONB,
ADD COLUMN re_nokanji BOOLEAN;

ALTER TABLE senses
ADD COLUMN xref JSONB,
ADD COLUMN ant JSONB,
ADD COLUMN lsource JSONB,
ADD COLUMN stagk JSONB,
ADD COLUMN stagr JSONB;