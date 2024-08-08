import { Router } from 'express';
import controller from '../controllers/index';

const router: Router = Router();

router.use('/api', controller);

export default router;