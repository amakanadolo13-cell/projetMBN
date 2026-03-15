import { Router } from 'express';
import { register, login, refreshTokens, updatePushToken, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshTokens);
router.put('/push-token', authenticate, updatePushToken);
router.get('/me', authenticate, getMe);

export default router;
