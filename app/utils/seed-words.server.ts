import { sql } from './db.server';
import wordsData from '../data/words.json';
import { downloadImage } from './image.server';

async function seedWords() {
  try {
    for (const [japanese, translations] of Object.entries(wordsData)) {
      // Check if word already exists
      const existingWord = await sql`
        SELECT id FROM words WHERE japanese_text = ${japanese}
      `;

      if (existingWord.length === 0) {
        // Download and store image locally
        const imageUrl = translations.image_url ? 
          await downloadImage(translations.image_url, `word-${japanese}`) : 
          null;

        // Insert new word
        const [wordRecord] = await sql`
          INSERT INTO words (japanese_text, image_url)
          VALUES (${japanese}, ${imageUrl})
          RETURNING id
        `;

        // Insert translations
        await sql`
          INSERT INTO translations (word_id, language, text)
          VALUES 
            (${wordRecord.id}, 'japanese', ${japanese}),
            (${wordRecord.id}, 'japanese_romaji', ${translations.romaji}),
            (${wordRecord.id}, 'english', ${translations.english}),
            (${wordRecord.id}, 'nepali', ${translations.nepali})
        `;
      }
    }

    console.log('Word seeding completed successfully!');

  } catch (error) {
    console.error('Error during word seeding:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedWords().catch((error) => {
  console.error('Error during word seeding:', error);
  process.exit(1);
}); 