import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { 
  findAudioByEntSeq,
  createAudioRecord,
} from '~/models/jmdictAudioModel';

const AUDIO_CACHE_DIR = path.join(process.cwd(), 'public/audio');

async function getOrCreateAudio(ent_seq: number, text: string): Promise<string | null> {
  try {
    if (!ent_seq || !text) {
      console.error('Missing required parameters:', { ent_seq, text });
      return null;
    }

    const existing = await findAudioByEntSeq(ent_seq);
    if (existing?.filename) {
      console.log('audio exists, returning', ent_seq)
      return `/audio/${existing.filename}`;
    }

    // Call Sound of Text API if not in DB
    const response = await fetch('https://api.soundoftext.com/sounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engine: 'Google',
        data: { text, voice: 'ja-JP' }
      })
    });

    const { id } = await response.json();
    
    // Poll for audio URL
    let attempts = 0;
    while (attempts < 10) {
      const statusRes = await fetch(`https://api.soundoftext.com/sounds/${id}`);
      const status = await statusRes.json();
      
      if (status.status === 'Done') {
        // Download and save audio
        const audioResponse = await fetch(status.location);
        const ext = path.extname(new URL(status.location).pathname) || '.mp3';
        const filename = `${ent_seq}-${uuidv4()}${ext}`;
        const filePath = path.join(AUDIO_CACHE_DIR, filename);

        await fs.mkdir(AUDIO_CACHE_DIR, { recursive: true });
        await fs.writeFile(filePath, Buffer.from(await audioResponse.arrayBuffer()));
        
        // Store in database
        const created = await createAudioRecord(ent_seq, filename, status.location);
        if (!created?.filename) {
          throw new Error('Audio record creation failed');
        }
        
        return `/audio/${created.filename}`;
      }
      
      if (status.status === 'Error') break;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    return null;
  } catch (error) {
    console.error('Audio processing error:', error);
    return null;
  }
}

export async function getJapaneseAudioUrl(text: string, ent_seq: number): Promise<string | null> {
  try {
    return await getOrCreateAudio(ent_seq, text);
  } catch (error) {
    console.error('Audio processing error:', error);
    return null;
  }
} 