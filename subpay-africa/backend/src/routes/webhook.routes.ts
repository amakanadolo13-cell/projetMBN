import { Router } from 'express';
import { handleOrangeWebhook, handleMTNWebhook, handleAirtelWebhook } from '../controllers/webhook.controller';

const router = Router();

router.post('/orange', handleOrangeWebhook);
router.post('/mtn', handleMTNWebhook);
router.post('/airtel', handleAirtelWebhook);

export default router;
