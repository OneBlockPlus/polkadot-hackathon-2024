import fetch from 'node-fetch';
import { UnsplashImage } from '../../data-model/unspash-image';
import { OpenAiService } from './openAiService';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
  throw new Error('Missing Unsplash access key. Please add it to your environment variables.');
}

interface UnsplashSearchResponse {
  results: UnsplashImage[];
}

export class UnsplashService {
  static async searchImages(query: string, perPage: number = 1): Promise<UnsplashImage[]> {
    const categories = await OpenAiService.generateCategories(query);

    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(categories)}&per_page=${perPage}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching images: ${response.statusText}`);
    }

    const data: UnsplashSearchResponse = (await response.json()) as UnsplashSearchResponse;
    return data.results;
  }
}
