import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAiService } from '../../../lib/services/openAiService';
import { TemplateType } from '../../../data-model/template-type';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const { daoDescription, templateType } = req.body as { daoDescription: string; templateType: TemplateType };

    if (!daoDescription || typeof daoDescription !== 'string') {
      return res.status(400).json({ message: 'daoDescription is required and must be a string' });
    }

    if (!templateType || typeof templateType !== 'string') {
      return res.status(400).json({ message: 'templateType is required' });
    }

    const completion = await OpenAiService.generateTemplate(daoDescription, templateType);

    res.status(200).json(completion.choices[0].message);
  } catch (error) {
    res.status(500).json({ message: 'Error with OpenAI API', error: error.message });
  }
}
