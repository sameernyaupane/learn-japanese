import { sql } from '~/utils/db.server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface FuriganaEntry {
  text: string;
  reading: string;
  furigana: Array<{
    ruby: string;
    rt?: string;
  }>;
}

export async function seedJmdictFurigana() {
  try {
    const filePath = path.resolve(__dirname, '../data/JMdictFurigana.json');
    console.log(`Reading data file from: ${filePath}`);
    
    // Read file and remove BOM if present
    const rawData = fs.readFileSync(filePath, 'utf-8')
      .replace(/^\uFEFF/, ''); // Remove UTF-8 BOM
      
    // Add JSON validation
    const entries: FuriganaEntry[] = JSON.parse(rawData);
    
    if (!Array.isArray(entries)) {
      throw new Error('Invalid JSON structure - expected root array');
    }
    
    if (!entries[0]?.text || !entries[0]?.reading || !entries[0]?.furigana) {
      throw new Error('Malformed entries - expected text, reading, and furigana fields');
    }

    console.log(`Starting seed of ${entries.length} furigana entries...`);

    const batchSize = 500;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      try {
        await sql`
          INSERT INTO jmdict_furigana (entry_id, text, reading, furigana)
          SELECT 
            je.id,
            batched.text,
            batched.reading,
            jsonb_agg(
              jsonb_build_object(
                'ruby', f.value->>'ruby',
                'rt', CASE WHEN (f.value->>'rt') = '' THEN NULL ELSE f.value->>'rt' END
              )
            ) as furigana
          FROM jsonb_to_recordset(${sql.json(batch)}::jsonb) AS batched(
            text text,
            reading text,
            furigana jsonb
          )
          CROSS JOIN jsonb_array_elements(batched.furigana) AS f
          INNER JOIN jmdict_entries je
            ON je.id = (
              SELECT k.entry_id 
              FROM kanji_elements k
              INNER JOIN kana_elements r 
                ON r.entry_id = k.entry_id
                AND r.position = 1  -- First kana element
              WHERE k.keb = batched.text
                AND r.reb = batched.reading
                AND k.position = 1  -- First kanji element
              LIMIT 1
            )
          GROUP BY je.id, batched.text, batched.reading
          ON CONFLICT (text, reading) DO UPDATE SET
            entry_id = EXCLUDED.entry_id,
            furigana = EXCLUDED.furigana
        `;
        console.log(`✅ Processed batch ${i / batchSize + 1} (entries ${i}-${Math.min(i + batchSize, entries.length) - 1})`);
      } catch (error) {
        console.error(`❌ Error processing batch ${i / batchSize + 1}:`, error);
        throw error; // Rethrow to exit the process
      }
    }

    console.log(`🎉 Successfully seeded ${entries.length} furigana entries`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    // Add database connection cleanup
    await sql.end();
    console.log('🛑 Database connection closed');
  }
}

// Add this at the end of the file to actually execute the function
seedJmdictFurigana()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }); 