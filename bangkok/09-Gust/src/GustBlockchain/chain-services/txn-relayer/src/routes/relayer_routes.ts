import express from 'express';
import { deployingSmartContract, signingAndSending } from '../controller/relayer_controller';
import { authenticateJwt } from '../services/auth_service';

const router = express.Router();

router.post('/relay-transaction', signingAndSending);
router.post('/deploy-contract', deployingSmartContract);

export default router;
