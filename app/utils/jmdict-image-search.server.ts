import type { JMdictEntry } from '~/types/jmdict';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function getFirstSenseImageUrl(entry: JMdictEntry): Promise<string | null> {
    if (!PEXELS_API_KEY) return null;
    
    const firstSense = entry.senses?.[0];
    if (!firstSense) return null;

    // Get the first English gloss as search query
    const searchTerm = firstSense.glosses.find(g => g.lang === 'eng')?.text;
    if (!searchTerm) return null;

    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=1`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        
        if (!response.ok) return null;
        
        const data = await response.json() as any;
        return data.photos?.[0]?.src?.medium || null;
    } catch (error) {
        console.error('Pexels API error:', error);
        return null;
    }
} 