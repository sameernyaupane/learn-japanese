import type { JMdictEntry } from '~/types/jmdict';
import 'dotenv/config';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function getFirstSenseImageUrl(entry: JMdictEntry): Promise<string | null> {
    // Add debug logs for search flow
    console.debug(`[Pexels] Processing entry ${entry.id}`);
    
    const firstSense = entry.senses?.[0];
    if (!firstSense) {
        console.debug('[Pexels] No senses available');
        return null;
    }

    console.log('firstsense ', firstSense)

    const searchTerm = firstSense.glosses.find(g => g.lang === 'en')?.gloss;
    console.debug(`[Pexels] Search term: ${searchTerm || 'NO_ENGLISH_GLOSS'}`);
    
    // Add validation after searchTerm extraction
    if (!searchTerm) {
        console.debug(
            '[Pexels] No English gloss found. Available gloss languages:',
            firstSense.glosses.map(g => g.lang).join(', ')
        );
        return null;
    }

    try {
        console.debug(`[Pexels] Initiating search for "${searchTerm}"`);
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        
        console.debug(`[Pexels] Response status: ${response.status}`);
        if (!response.ok) {
            console.error(`[Pexels] API Error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        console.debug(`[Pexels] Found ${data.photos?.length || 0} results`);
        
        return data.photos?.[0]?.src?.medium || null;
    } catch (error) {
        console.error('[Pexels] Network error:', error);
        return null;
    }
} 