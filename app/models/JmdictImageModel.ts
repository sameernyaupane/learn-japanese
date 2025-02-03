import type { JMdictImage } from '~/types/jmdict';
import { sql } from '~/utils/db.server';

export async function findImageByEntSeq(ent_seq: number): Promise<JMdictImage | null> {
  const [result] = await sql<JMdictImage[]>`
    SELECT * FROM jmdict_images 
    WHERE ent_seq = ${ent_seq}
    LIMIT 1
  `;
  return result || null;
}

export async function findImageByFilename(filename: string): Promise<JMdictImage | null> {
  const [result] = await sql<JMdictImage[]>`
    SELECT * FROM jmdict_images 
    WHERE filename = ${filename}
    LIMIT 1
  `;
  return result || null;
}

export async function createImageRecord(
  ent_seq: number,
  filename: string
): Promise<JMdictImage> {
  const [result] = await sql<JMdictImage[]>`
    INSERT INTO jmdict_images (ent_seq, filename)
    VALUES (${ent_seq}, ${filename})
    RETURNING *
  `;
  return result;
}

export async function imageExists(ent_seq: number): Promise<boolean> {
  const [result] = await sql<{ exists: boolean }[]>`
    SELECT EXISTS(
      SELECT 1 FROM jmdict_images 
      WHERE ent_seq = ${ent_seq}
    )
  `;
  return result.exists;
}