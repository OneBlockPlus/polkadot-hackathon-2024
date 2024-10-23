import express from 'express';
import { userSignUp, userLogin, verifyOtp} from '../controller/user_controller';

const router = express.Router();

router.post('/signup', userSignUp);
router.post('/verify-otp', verifyOtp);
router.post('/login', userLogin);

export default router;
