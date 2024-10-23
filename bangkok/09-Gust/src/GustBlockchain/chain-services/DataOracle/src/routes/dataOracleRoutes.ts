import { Router } from "express";
import { tokenPrice, swap, transfer } from '../handlers/oracleInteractions';

const router = Router();

router.get('/token-price/{tokenSymbol}',tokenPrice);
router.post('/swap', swap);
router.post('/transfer', transfer);

export default router;