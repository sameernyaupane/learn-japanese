-- Example for Japanese verb 食べる (taberu - to eat)
INSERT INTO word_forms (base_word_id, form, language, conjugated_text) VALUES
  (1, 'plain-present', 'japanese', '食べる'),
  (1, 'polite-present', 'japanese', '食べます'),
  (1, 'te', 'japanese', '食べて'),
  (1, 'polite-past', 'japanese', '食べました');

-- Same verb in romaji
INSERT INTO word_forms (base_word_id, form, language, conjugated_text) VALUES
  (1, 'plain-present', 'japanese_romaji', 'taberu'),
  (1, 'polite-present', 'japanese_romaji', 'tabemasu'),
  (1, 'te', 'japanese_romaji', 'tabete'),
  (1, 'polite-past', 'japanese_romaji', 'tabemashita');

-- English conjugations
INSERT INTO word_forms (base_word_id, form, language, conjugated_text) VALUES
  (1, 'plain-present', 'english', 'eat'),
  (1, 'polite-present', 'english', 'please eat'),
  (1, 'te', 'english', 'eating'),
  (1, 'polite-past', 'english', 'please ate'); 