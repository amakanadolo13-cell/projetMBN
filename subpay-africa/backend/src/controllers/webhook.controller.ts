import { Request, Response } from 'express';
import prisma from '../config/database';
import { notificationService } from '../services/notification.service';
import { processOrderActivation } from './order.controller';

// Valider et traiter le paiement confirmé
async function handlePaymentSuccess(orderId: string, txnId: string, amount: number): Promise<void> {
  const payment = await prisma.payment.findFirst({ where: { orderId } });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'SUCCESSFUL',
      providerTxId: txnId,
      webhookReceivedAt: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAYMENT_CONFIRMED' },
  });

  // Notifier l'utilisateur que le paiement est reçu
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (order) {
    await notificationService.notifyPaymentReceived({
      pushToken: order.user.pushToken || undefined,
      phone: order.user.phone,
      amount: order.amountLocal,
      currency: order.currency,
      orderNumber: order.orderNumber,
    });
  }

  // Déclencher l'activation (async)
  processOrderActivation(orderId).catch(console.error);
}

async function handlePaymentFailure(orderId: string): Promise<void> {
  const payment = await prisma.payment.findFirst({ where: { orderId } });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'FAILED', webhookReceivedAt: new Date() },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'FAILED' },
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (order) {
    await notificationService.notifyPaymentFailed({
      pushToken: order.user.pushToken || undefined,
      phone: order.user.phone,
      orderNumber: order.orderNumber,
    });
  }
}

// Webhook Orange Money
export async function handleOrangeWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;

    await prisma.transactionLog.create({
      data: { type: 'WEBHOOK_ORANGE', data: payload },
    });

    if (payload.status === 'SUCCESS' || payload.status === 'SUCCESSFUL') {
      await handlePaymentSuccess(payload.orderId, payload.txnid, payload.amount);
    } else {
      await handlePaymentFailure(payload.orderId);
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.error('[Webhook] Orange error:', err);
    res.status(500).json({ status: 'ERROR' });
  }
}

// Webhook MTN MoMo
export async function handleMTNWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;

    await prisma.transactionLog.create({
      data: { type: 'WEBHOOK_MTN', data: payload },
    });

    // MTN envoie le referenceId comme externalId
    const payment = await prisma.payment.findFirst({
      where: { providerRef: payload.referenceId || payload.externalId },
    });

    if (!payment) {
      res.json({ status: 'OK' });
      return;
    }

    if (payload.status === 'SUCCESSFUL') {
      await handlePaymentSuccess(payment.orderId, payload.financialTransactionId, payload.amount);
    } else if (payload.status === 'FAILED') {
      await handlePaymentFailure(payment.orderId);
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.error('[Webhook] MTN error:', err);
    res.status(500).json({ status: 'ERROR' });
  }
}

// Webhook Airtel Money
export async function handleAirtelWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;

    await prisma.transactionLog.create({
      data: { type: 'WEBHOOK_AIRTEL', data: payload },
    });

    const txn = payload.transaction;
    const payment = await prisma.payment.findFirst({
      where: { providerRef: txn?.id },
    });

    if (!payment) {
      res.json({ status: 'OK' });
      return;
    }

    if (txn?.status_code === 'TS') {
      await handlePaymentSuccess(payment.orderId, txn.airtel_money_id || txn.id, 0);
    } else if (txn?.status_code === 'TF') {
      await handlePaymentFailure(payment.orderId);
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.error('[Webhook] Airtel error:', err);
    res.status(500).json({ status: 'ERROR' });
  }
}
