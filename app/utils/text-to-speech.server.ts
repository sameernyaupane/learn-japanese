export async function getJapaneseAudioUrl(text: string): Promise<string | null> {
  const response = await fetch('https://api.soundoftext.com/sounds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      engine: 'Google',
      data: {
        text: text,
        voice: 'ja-JP'
      }
    })
  });

  const { id } = await response.json();
  
  // Poll for audio URL
  let attempts = 0;
  while (attempts < 10) {
    const statusRes = await fetch(`https://api.soundoftext.com/sounds/${id}`);
    const status = await statusRes.json();
    
    if (status.status === 'Done') {
      return status.location;
    }
    if (status.status === 'Error') {
      return null;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }
  
  return null;
} 