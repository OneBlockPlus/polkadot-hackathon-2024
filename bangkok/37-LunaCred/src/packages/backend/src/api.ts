import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import userRank from '@components/userRank/userRank.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(userRank);

export default router;
