import { NextApiRequest, NextApiResponse } from 'next';
import { UnsplashService } from '../../../lib/services/unsplashService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  try {
    const { query, perPage } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'query is required and must be a string' });
    }

    if (perPage && typeof Number(perPage) !== 'number') {
      return res.status(400).json({ message: 'perPage must be a number' });
    }

    const images = await UnsplashService.searchImages(query as string, Number(perPage) || 3);

    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json({ message: 'Error with OpenAI API', error: error.message });
  }
}
