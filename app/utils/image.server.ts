import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

// Ensure the images directory exists
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

export async function downloadImage(imageUrl: string, index: number): Promise<string> {
  try {
    const extension = path.extname(imageUrl) || '.jpg';
    const fileName = `phrase-${index}${extension}`;
    const filePath = path.join(PUBLIC_IMAGES_DIR, fileName);
    const publicPath = `/images/${fileName}`;

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return publicPath;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Save the image to the public directory
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);

    return publicPath;
  } catch (error) {
    console.error(`Error downloading image ${imageUrl}:`, error);
    return '/images/fallback.jpg';
  }
} 