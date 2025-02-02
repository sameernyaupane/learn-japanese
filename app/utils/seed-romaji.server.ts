import { sql } from '~/utils/db.server';
import Wanakana from 'wanakana';

export async function seedRomaji() {
  console.log('🎌 Starting romaji generation...');
  
  // Get all kana elements without romaji
  const kanaElements = await sql`
    SELECT id, reb FROM kana_elements 
    WHERE romaji IS NULL OR romaji = ''
  `;

  console.log(`📝 Found ${kanaElements.count} kana elements to process`);

  // Process in batches
  const BATCH_SIZE = 1000;
  for (let i = 0; i < kanaElements.length; i += BATCH_SIZE) {
    const batch = kanaElements.slice(i, i + BATCH_SIZE);
    
    await sql.begin(async (tx) => {
      for (const kana of batch) {
        const romaji = Wanakana.toRomaji(kana.reb, {
          upcaseKatakana: true,
          imemode: true
        });

        await tx`
          UPDATE kana_elements
          SET romaji = ${romaji}
          WHERE id = ${kana.id}
        `;
      }
    });

    console.log(`✅ Processed ${Math.min(i + BATCH_SIZE, kanaElements.length)}/${kanaElements.length}`);
  }

  console.log('🎉 Finished romaji generation');
}

// Run directly if called
if (import.meta.url.endsWith(process.argv[1])) {
  (async () => {
    try {
      await seedRomaji();
      process.exit(0);
    } catch (err) {
      console.error('💥 Romaji seed failed:', err);
      process.exit(1);
    }
  })();
} 