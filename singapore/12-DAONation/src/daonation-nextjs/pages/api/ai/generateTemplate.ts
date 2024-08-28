import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAiService } from '../../../lib/services/openAiService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { daoDescription } = req.body;

    if (!daoDescription || typeof daoDescription !== 'string') {
      return res.status(400).json({ message: 'daoDescription is required and must be a string' });
    }

    const completion = await OpenAiService.generateTemplate(daoDescription);

    res.status(200).json(completion.choices[0].message);
  } catch (error) {
    res.status(500).json({ message: 'Error with OpenAI API', error: error.message });
  }
}
