import type { JMdictEntry } from '~/types/jmdict';
import 'dotenv/config';
import { db } from '~/utils/db.server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { 
  findImageByEntSeq,
  createImageRecord,
  imageExists
} from '~/models/JmdictImageModel;

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public/images');

async function getOrCreateImage(ent_seq: number, searchTerm: string): Promise<string | null> {
    // Check database first
    const existing = await findImageByEntSeq(ent_seq);
    if (existing) {
        return `/images/${existing.filename}`;
    }

    // Call Pexels API if not in DB
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1`, {
        headers: { Authorization: PEXELS_API_KEY }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const photo = data.photos?.[0];
    if (!photo) return null;

    // Download and save image
    const imageResponse = await fetch(photo.src.medium);
    const ext = path.extname(photo.src.medium) || '.jpg';
    const filename = `${ent_seq}-${uuidv4()}${ext}`;
    const filePath = path.join(IMAGE_CACHE_DIR, filename);

    await fs.mkdir(IMAGE_CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(await imageResponse.arrayBuffer()));

    // Store in database
    const newImage = await createImageRecord(ent_seq, filename);
    
    return `/images/${newImage.filename}`;
}

export async function getFirstSenseImageUrl(entry: JMdictEntry): Promise<string | null> {
    try {
        const firstSense = entry.senses?.[0];
        if (!firstSense) return null;

        const searchTerm = firstSense.glosses.find(g => g.lang === 'en')?.gloss;
        if (!searchTerm) return null;

        return await getOrCreateImage(entry.ent_seq, searchTerm);
    } catch (error) {
        console.error('Image processing error:', error);
        return null;
    }
} 