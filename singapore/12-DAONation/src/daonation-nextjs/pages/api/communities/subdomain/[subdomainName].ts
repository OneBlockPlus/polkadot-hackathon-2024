import { NextApiRequest, NextApiResponse } from 'next';
import CommunityService from '../../../../lib/services/communityService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subdomainName } = req.query;

  switch (req.method) {
    case 'GET':
      const community = await CommunityService.getBySubdomainName(subdomainName as string);
      if (community) {
        res.status(200).json(community);
      } else {
        res.status(404).json({ error: 'Community not found' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
