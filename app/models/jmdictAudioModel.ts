import { sql } from '~/utils/db.server';

export async function findAudioByEntSeq(ent_seq: number) {
  if (!ent_seq || isNaN(ent_seq)) {
    console.error('Invalid ent_seq:', ent_seq);
    return null;
  }
  
  return sql`
    SELECT * FROM jmdict_audio
    WHERE ent_seq = ${ent_seq}
    LIMIT 1
  `.then((result) => result.length ? result[0] : null)
   .catch((err) => {
     console.error('Database error:', err);
     return null;
   });
}

export async function createAudioRecord(
  ent_seq: number, 
  filename: string, 
  audio_url: string
) {
  if (!ent_seq || !filename || !audio_url) {
    console.error('Missing required fields:', { ent_seq, filename, audio_url });
    throw new Error('All fields are required');
  }

  return sql`
    INSERT INTO jmdict_audio (ent_seq, filename, audio_url)
    VALUES (${ent_seq}, ${filename}, ${audio_url})
    RETURNING *
  `.then((result) => result.length ? result[0] : null)
   .catch((err) => {
     console.error('Database error:', err);
     return null;
   });
}

export async function audioExists(ent_seq: number) {
  if (!ent_seq || isNaN(ent_seq)) {
    return false;
  }
  
  return sql`
    SELECT 1 FROM jmdict_audio
    WHERE ent_seq = ${ent_seq}
    LIMIT 1
  `.then(([row]) => !!row);
} 