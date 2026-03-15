import { Router } from 'express';
import { getCatalog, createOrder, getOrders, getOrderById } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { paymentLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.get('/catalog', authenticate, getCatalog);
router.post('/', authenticate, paymentLimiter, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

export default router;
