import { sql } from '~/utils/db.server';
import { XMLParser } from 'fast-xml-parser';
import { createReadStream } from 'fs';
import { readFileSync } from 'fs';
import sax from 'sax';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function seedJMdict() {
  return new Promise<void>((resolve, reject) => {
    try {
      const filePath = path.resolve(__dirname, '../data/sample.xml');
      const parser = sax.createStream(false, {
        trim: true,
        xmlns: false,
        strictEntities: false,
        entities: {
          'amp': '&',
          'apos': "'",
          'gt': '>',
          'lt': '<',
          'quot': '"',
          'unc': 'unclassified',
          'n': 'noun',
          'adj-na': 'adjectival noun',
        }
      });
      const readStream = fs.createReadStream(filePath, 'utf-8');
      
      // Add progress logging
      console.log('🔍 Opening file stream...');
      readStream.on('open', () => console.log('📂 File stream opened'));
      parser.on('ready', () => console.log('⚙️ Parser initialized'));
      
      let inEntry = false;
      let currentElement: string | null = null;
      let entryCount = 0;
      let shouldProcess = true;
      let elementStack: string[] = [];  // Track nested elements
      let tempEntry: any = null; // Temporary entry object

      parser.on('opentag', (node) => {
        if (!shouldProcess) return;
        const elementName = node.name.toLowerCase();
        elementStack.push(elementName);

        if (elementName === 'entry') {
          inEntry = true;
          tempEntry = { k_ele: [], r_ele: [], sense: [] };
        }
        else if (elementName === 'r_ele') {
          tempEntry.r_ele.push({});
        }
        else if (elementName === 'sense') {
          tempEntry.sense.push({});
        }
      });

      parser.on('entity', (entity) => {
        if (!shouldProcess) return;
      });

      parser.on('text', (text) => {
        if (!shouldProcess || !inEntry || !tempEntry) return;

        const currentPath = elementStack.map(e => e.toLowerCase()).join('.');
        const trimmedText = text.trim();

        if (currentPath === 'jmdict.entry.ent_seq') {
          tempEntry.ent_seq = trimmedText;
        }
        else if (currentPath === 'jmdict.entry.r_ele.reb') {
          const lastIndex = tempEntry.r_ele.length - 1;
          if (lastIndex >= 0) {
            tempEntry.r_ele[lastIndex].reb = trimmedText;
          }
        }
        else if (currentPath === 'jmdict.entry.sense.pos') {
          const lastSenseIndex = tempEntry.sense.length - 1;
          if (lastSenseIndex >= 0) {
            tempEntry.sense[lastSenseIndex].pos = [trimmedText];
          }
        }
        else if (currentPath === 'jmdict.entry.sense.xref') {
          const lastSenseIndex = tempEntry.sense.length - 1;
          if (lastSenseIndex >= 0) {
            tempEntry.sense[lastSenseIndex].xref = [trimmedText];
          }
        }
        else if (currentPath === 'jmdict.entry.sense.gloss') {
          const lastSenseIndex = tempEntry.sense.length - 1;
          if (lastSenseIndex >= 0) {
            tempEntry.sense[lastSenseIndex].gloss = [{
              '#text': trimmedText,
              '@_xml:lang': 'en'
            }];
          }
        }
      });

      parser.on('closetag', (tagName) => {
        if (!shouldProcess) return;

        const closedElement = elementStack.pop();

        if (tagName.toLowerCase() === 'entry') {
          inEntry = false;
          entryCount++;

          // Process the entry without stopping the stream
          processBatch([tempEntry])
            .catch(reject);
            
          tempEntry = null; // Reset for next entry
        }

        // Clear current element when exiting nested tags
        if (inEntry && elementStack.length > 0 && elementStack[elementStack.length - 1] === 'entry') {
          currentElement = null;
        }
      });

      parser.on('end', () => {
        console.log('🔚 Parser ended naturally');
        if (entryCount === 0) {
          reject(new Error('No entries found in XML file'));
        } else {
          console.log('🏁 Finished processing XML stream');
          resolve();
        }
      });

      // Add error logging
      readStream.on('error', (err) => {
        console.error('💥 READ ERROR:', err.message);
        reject(err);
      });
      
      parser.on('error', (err) => {
        console.error('💥 PARSE ERROR:', err.message);
        console.error('⚠️ Current element stack:', elementStack);
        reject(err);
      });

      console.log('🌱 STARTING SEED...');
      readStream.pipe(parser);

    } catch (error) {
      console.error('💥 Initialization error:', error);
      reject(error);
    }
  });
}

async function processBatch(batch: any[]) {
  await sql.begin(async (tx) => {
    for (const entry of batch) {
      if (!entry.ent_seq) {
        throw new Error('Missing ent_seq in entry');
      }
      console.log('Processing entry:', entry.ent_seq);
      
      const entSeq = parseInt(entry.ent_seq);
      if (isNaN(entSeq)) {
        throw new Error(`Invalid ent_seq value: ${entry.ent_seq}`);
      }
      
      const [entryRecord] = await tx`
        INSERT INTO jmdict_entries (ent_seq)
        VALUES (${entSeq})
        RETURNING id
      `;
      console.log('📥 Inserted entry ID:', entryRecord.id);

      // Process Kanji elements
      if (entry.k_ele) {
        console.log('Kanji elements:', entry.k_ele);
        for (const kEle of entry.k_ele) {
          await tx`
            INSERT INTO kanji_elements (entry_id, keb, ke_inf, pri)
            VALUES (
              ${entryRecord.id}, 
              ${kEle.keb}, 
              ${tx.json(kEle.ke_inf || [])},
              ${tx.json(kEle.ke_pri || [])}
            )
          `;
          console.log('  ⬇️ Inserted kanji:', kEle.keb);
        }
      }

      // Process Reading elements
      if (entry.r_ele) {
        const rElements = Array.isArray(entry.r_ele) ? entry.r_ele : [entry.r_ele];
        for (const rEle of rElements) {
          await tx`
            INSERT INTO kana_elements (
              entry_id, 
              reb, 
              re_nokanji, 
              re_restr, 
              re_inf, 
              pri
            )
            VALUES (
              ${entryRecord.id},
              ${rEle.reb || rEle.REB},
              ${!!rEle.re_nokanji || !!rEle.RE_NOKANJI},
              ${tx.json(rEle.re_restr || rEle.RE_RESTR || [])},
              ${tx.json(rEle.re_inf || rEle.RE_INF || [])},
              ${tx.json(rEle.re_pri || rEle.RE_PRI || [])}
            )
          `;
          console.log('  📖 Inserted reading:', rEle.reb || rEle.REB);
        }
      }

      // Process Senses
      if (entry.sense) {
        const senses = Array.isArray(entry.sense) ? entry.sense : [entry.sense];
        console.log('Senses count:', senses.length);
        
        for (const sense of senses) {
          // Handle text nodes in elements
          const processTextNodes = (obj: any) => {
            if (obj && obj['#text']) return obj['#text'];
            if (typeof obj === 'string') return obj;
            return obj;
          };

          const processedSense = {
            stagk: (sense.stagk || []).map(processTextNodes),
            stagr: (sense.stagr || []).map(processTextNodes),
            pos: (sense.pos || []).map(processTextNodes),
            xref: (sense.xref || []).map(processTextNodes),
            ant: (sense.ant || []).map(processTextNodes),
            field: (sense.field || []).map(processTextNodes),
            misc: (sense.misc || []).map(processTextNodes),
            dial: (sense.dial || []).map(processTextNodes),
            lsource: sense.lsource || [],
            s_inf: (sense.s_inf || []).map(processTextNodes),
            gloss: sense.gloss || []
          };

          // Insert sense and process glosses
          const [senseRecord] = await tx`
            INSERT INTO senses (
              entry_id,
              stagk,
              stagr,
              pos,
              xref,
              ant,
              field,
              misc,
              dial,
              lsource,
              s_inf,
              glosses
            )
            VALUES (
              ${entryRecord.id},
              ${tx.json(processedSense.stagk)},
              ${tx.json(processedSense.stagr)},
              ${tx.json(processedSense.pos)},
              ${tx.json(processedSense.xref)},
              ${tx.json(processedSense.ant)},
              ${tx.json(processedSense.field)},
              ${tx.json(processedSense.misc)},
              ${tx.json(processedSense.dial)},
              ${tx.json(processedSense.lsource)},
              ${tx.json(processedSense.s_inf)},
              ${tx.json(processedSense.gloss)}
            )
            RETURNING id
          `;

          // Process Glosses
          if (processedSense.gloss) {
            const glosses = Array.isArray(processedSense.gloss) 
              ? processedSense.gloss 
              : [processedSense.gloss];
            
            for (const glossEntry of glosses) {
              const glossText = processTextNodes(glossEntry);
              if (glossText) {
                await tx`
                  INSERT INTO glosses (
                    sense_id, 
                    lang, 
                    gloss, 
                    g_gend, 
                    g_type
                  )
                  VALUES (
                    ${senseRecord.id},
                    ${glossEntry['@_xml:lang'] || 'en'},
                    ${glossText},
                    ${glossEntry['@_g_gend'] || null},
                    ${glossEntry['@_g_type'] || null}
                  )
                `;
              }
            }
          }

          // Process Examples
          if (sense.example) {
            for (const example of sense.example) {
              if (example.ex_sent) {
                const examples = Array.isArray(example.ex_sent) ? example.ex_sent : [example.ex_sent];
                
                for (const exSent of examples) {
                  await tx`
                    INSERT INTO examples (
                      sense_id, 
                      source, 
                      text, 
                      translation
                    )
                    VALUES (
                      ${senseRecord.id},
                      ${tx.json({
                        type: example.ex_srce?.['@_exsrc_type'],
                        text: example.ex_srce?.['#text'] || ''
                      })},
                      ${example.ex_text?.['#text'] || ''},
                      ${tx.json(
                        (Array.isArray(example.ex_sent) ? example.ex_sent : [example.ex_sent])
                          .map((es: any) => ({
                            text: es['#text'],
                            lang: es['@_xml:lang'] || 'en'
                          }))
                      )}
                    )
                  `;
                  console.log('  📚 Inserted example:', exSent['#text']);
                }
              }
            }
          }
        }
      }
    }
  });
}

async function runSeed() {  
  try {
    console.log('🚀 Starting seed...');
    await seedJMdict();

    // Add single verification at the end
    console.log('\n✅ Final database state:');
    const entryCount = await sql`SELECT COUNT(*) FROM jmdict_entries`;
    const kanjiCount = await sql`SELECT COUNT(*) FROM kanji_elements`;
    const kanaCount = await sql`SELECT COUNT(*) FROM kana_elements`;
    const senseCount = await sql`SELECT COUNT(*) FROM senses`;
    const glossCount = await sql`SELECT COUNT(*) FROM glosses`;
    const exampleCount = await sql`SELECT COUNT(*) FROM examples`;

    console.log({
      entries: entryCount[0].count,
      kanjiElements: kanjiCount[0].count,
      kanaElements: kanaCount[0].count,
      senses: senseCount[0].count,
      glosses: glossCount[0].count,
      examples: exampleCount[0].count
    });

  } catch (err) {
    console.error('💥 Seed failed:', err);
    process.exit(1);
  } finally {
    // Add database connection cleanup
    await sql.end();
    console.log('🛑 Database connection closed');
    process.nextTick(() => process.exit(0));
  }
}

// Execute directly when run
if (import.meta.url.endsWith(process.argv[1])) {
  runSeed();
} 