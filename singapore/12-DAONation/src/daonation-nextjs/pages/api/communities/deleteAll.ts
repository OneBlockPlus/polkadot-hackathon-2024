import { NextApiRequest, NextApiResponse } from 'next';
import CommunityService from '../../../lib/services/communityService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        await CommunityService.deleteAll();
        res.status(200).json({ message: 'all deleted' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch communities' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
