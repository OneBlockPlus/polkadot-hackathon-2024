import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAiService } from '../../../lib/services/openAiService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { goalDescription, daoDescription } = req.body;

    if (!goalDescription || typeof goalDescription !== 'string') {
      return res.status(400).json({ message: 'goalDescription is required and must be a string' });
    }

    if (!daoDescription || typeof daoDescription !== 'string') {
      return res.status(400).json({ message: 'daoDescription is required and must be a string' });
    }

    const ideas = await OpenAiService.generateIdeas(goalDescription, daoDescription);

    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Error with OpenAI API', error: error.message });
  }
}
