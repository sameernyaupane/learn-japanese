CREATE TABLE IF NOT EXISTS jmdict_entries (
  id SERIAL PRIMARY KEY,
  ent_seq INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS kanji_elements (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES jmdict_entries(id),
  keb TEXT NOT NULL,
  ke_inf JSONB,
  pri JSONB
);

CREATE TABLE IF NOT EXISTS kana_elements (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES jmdict_entries(id),
  reb TEXT NOT NULL,
  re_nokanji BOOLEAN,
  re_restr JSONB,
  re_inf JSONB,
  pri JSONB
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

CREATE INDEX idx_kanji_entry_id ON kanji_elements(entry_id);
CREATE INDEX idx_kana_entry_id ON kana_elements(entry_id);
CREATE INDEX idx_senses_entry_id ON senses(entry_id);
CREATE INDEX idx_glosses_sense_id ON glosses(sense_id);