import { Router } from 'express';
import { getCatalog, createOrder, getOrders, getOrderById } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/catalog', authenticate, getCatalog);
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

export default router;
