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
  return new Promise((resolve, reject) => {
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
      let currentEntry: any = {};
      let currentElement: string | null = null;
      let entryCount = 0;
      let shouldProcess = true;
      let elementStack: string[] = [];  // Track nested elements

      parser.on('opentag', (node) => {
        if (!shouldProcess) return;
        console.log('📂 Opened tag:', node.name);
        
        // Track element hierarchy
        elementStack.push(node.name.toLowerCase());
        
        const elementName = node.name.toLowerCase();
        
        if (elementName === 'jmdict') {
          console.log('✅ ROOT ELEMENT DETECTED');
        }
        
        if (elementName === 'entry') {
          console.log('🚪 ENTRY START');
          inEntry = true;
          currentEntry = { k_ele: [], r_ele: [], sense: [] }; // Initialize arrays for nested elements
        }
        
        if (inEntry && elementName !== 'entry') {
          currentElement = node.name;
        }
      });

      parser.on('entity', (entity) => {
        if (!shouldProcess) return;
        console.log('🔠 Entity detected:', entity);
      });

      parser.on('text', (text) => {
        if (!shouldProcess || !inEntry || !currentElement) return;
        
        const entryDepth = elementStack.indexOf('entry');
        if (entryDepth === -1) return;

        // Calculate depth relative to entry
        const depth = elementStack.length - entryDepth - 1;
        
        if (depth === 1) {
          // Direct children of entry (ent_seq, k_ele, r_ele, sense)
          const propName = currentElement.toLowerCase();
          currentEntry[propName] = (currentEntry[propName] || '') + text.trim();
        } else {
          // Nested elements (keb, reb, pos, etc)
          const path = elementStack
            .slice(entryDepth + 1, -1) // Skip entry and current element
            .map(t => t.toLowerCase());

          let target = currentEntry;
          for (const segment of path) {
            target = target[segment] = target[segment] || (segment.endsWith('_ele') ? [] : {});
          }

          const currentSegment = currentElement.toLowerCase();
          if (Array.isArray(target)) {
            const lastItem = target[target.length - 1] || {};
            lastItem[currentSegment] = (lastItem[currentSegment] || '') + text.trim();
            target[target.length - 1] = lastItem;
          } else {
            target[currentSegment] = (target[currentSegment] || '') + text.trim();
          }
        }
      });

      parser.on('closetag', (tagName) => {
        if (!shouldProcess) return;
        
        const closedElement = elementStack.pop();
        
        if (tagName.toLowerCase() === 'entry') {
          console.log('🚪 ENTRY END');
          inEntry = false;
          entryCount++;

          if (entryCount === 1) {
            console.log('🔥 PROCESSING FIRST ENTRY');
            shouldProcess = false;
            
            // Let the parser finish naturally
            readStream.unpipe(parser);
            readStream.destroy();

            processBatch([currentEntry])
              .then(() => {
                console.log('✅ SEED COMPLETE');
                parser.end();
                resolve();
              })
              .catch(reject);
          }
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
      console.log('Processing entry:', entry.ent_seq);
      
      // Insert main entry
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
        console.log('Reading elements:', entry.r_ele);
        for (const rEle of entry.r_ele) {
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
              ${rEle.reb},
              ${!!rEle.re_nokanji},
              ${tx.json(rEle.re_restr || [])},
              ${tx.json(rEle.re_inf || [])},
              ${tx.json(rEle.re_pri || [])}
            )
          `;
          console.log('  📖 Inserted reading:', rEle.reb);
        }
      }

      // Process Senses
      if (entry.sense) {
        console.log('Senses count:', entry.sense.length);
        for (const sense of entry.sense) {
          console.log('Processing sense:', {
            pos: sense.pos,
            field: sense.field,
            misc: sense.misc,
            dial: sense.dial
          });

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
              ${tx.json(sense.stagk || [])},
              ${tx.json(sense.stagr || [])},
              ${tx.json(sense.pos || [])},
              ${tx.json(sense.xref?.map((x: any) => x['#text']) || [])},
              ${tx.json(sense.ant?.map((a: any) => a['#text']) || [])},
              ${tx.json(sense.field || [])},
              ${tx.json(sense.misc || [])},
              ${tx.json(sense.dial || [])},
              ${tx.json(sense.lsource?.map((ls: any) => ({
                lang: ls['@_xml:lang'] || 'eng',
                type: ls['@_ls_type'],
                wasei: ls['@_ls_wasei'],
                text: ls['#text']
              })) || [])},
              ${tx.json(sense.s_inf || [])},
              ${tx.json(sense.glosses || [])}
            )
            RETURNING id
          `;
          console.log('Inserted sense ID:', senseRecord.id);

          // Process Glosses
          if (sense.gloss) {
            for (const glossEntry of sense.gloss) {
              if (glossEntry.gloss) {
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
                    ${glossEntry.gloss['@_xml:lang'] || 'en'},
                    ${glossEntry.gloss['#text']},
                    ${glossEntry.gloss['@_g_gend'] || null},
                    ${glossEntry.gloss['@_g_type'] || null}
                  )
                `;
                console.log('  🌐 Inserted gloss:', {
                  lang: glossEntry.gloss['@_xml:lang'] || 'en',
                  text: glossEntry.gloss['#text']
                });
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

    // Verification query
    console.log('\n✅ Final database state:');
    const entryCount = await tx`SELECT COUNT(*) FROM jmdict_entries`;
    const kanjiCount = await tx`SELECT COUNT(*) FROM kanji_elements`;
    const kanaCount = await tx`SELECT COUNT(*) FROM kana_elements`;
    const senseCount = await tx`SELECT COUNT(*) FROM senses`;
    const glossCount = await tx`SELECT COUNT(*) FROM glosses`;
    const exampleCount = await tx`SELECT COUNT(*) FROM examples`;

    console.log({
      entries: entryCount[0].count,
      kanjiElements: kanjiCount[0].count,
      kanaElements: kanaCount[0].count,
      senses: senseCount[0].count,
      glosses: glossCount[0].count,
      examples: exampleCount[0].count
    });
  });
}

async function runSeed() {  
  try {
    console.log('🚀 Starting seed...');
    await seedJMdict();
  } catch (err) {
    console.error('💥 Seed failed:', err);
    process.exit(1);
  }
}

// Execute directly when run
if (import.meta.url.endsWith(process.argv[1])) {
  runSeed();
} 