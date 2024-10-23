import { Router } from 'express';

import userRank from './userRank.controller';

const router: Router = Router();

router.get('/userRank/:address', userRank);

export default router;
