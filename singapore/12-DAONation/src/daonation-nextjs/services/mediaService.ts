import { UnsplashImage } from '../data-model/unspash-image';

export class MediaService {
  static async getImages(query: string, perPage = 3): Promise<{ images: UnsplashImage[] }> {
    const response = await fetch(`/api/media?query=${query}&perPage=${perPage}`);
    if (!response.ok) {
      throw new Error('Failed to fetch communities');
    }
    const data = await response.json();
    return data;
  }
}
