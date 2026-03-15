import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { orangeMoneyService } from '../services/payments/orange-money.service';
import { mtnMomoService } from '../services/payments/mtn-momo.service';
import { airtelMoneyService } from '../services/payments/airtel-money.service';
import { reloadlyService } from '../services/subscriptions/reloadly.service';
import { notificationService } from '../services/notification.service';
import { CountryCode, formatPhone } from '../config/countries';
import { getProductsForCountry } from '../services/subscriptions/catalog.service';

// Génère un numéro de commande unique
function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ORD-${date}-${random}`;
}

export async function getCatalog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const country = (req.query.country as CountryCode) || req.userCountry as CountryCode;
    const products = await getProductsForCountry(country);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors du chargement du catalogue' });
  }
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId, paymentProvider, paymentPhone } = req.body;
    const userId = req.userId!;
    const country = req.userCountry as CountryCode;

    // Récupérer le produit
    const product = await prisma.subscriptionProduct.findUnique({
      where: { id: productId, isActive: true },
      include: {
        pricings: { where: { country, isActive: true } },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Produit non disponible' });
      return;
    }

    // Calculer le prix local
    const pricing = product.pricings[0];
    const priceLocal = pricing?.priceLocal || product.priceUSD * 600; // Fallback
    const currency = pricing?.currency || 'XAF';

    const formattedPhone = formatPhone(paymentPhone, country);

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        productId,
        status: 'PENDING',
        country,
        currency,
        amountLocal: priceLocal,
        amountUSD: product.priceUSD,
      },
    });

    // Log
    await prisma.transactionLog.create({
      data: {
        type: 'ORDER_CREATED',
        orderId: order.id,
        userId,
        data: { orderNumber: order.orderNumber, productId, priceLocal, currency },
      },
    });

    // Initier le paiement selon l'opérateur
    let paymentData: { txId?: string; referenceId?: string; paymentUrl?: string } = {};

    const description = `SubPay Africa - ${product.name}`;

    if (paymentProvider === 'ORANGE_MONEY') {
      const result = await orangeMoneyService.initiatePayment({
        orderId: order.id,
        amount: priceLocal,
        currency,
        phone: formattedPhone,
        country,
        description,
        callbackUrl: `${process.env.APP_URL}/api/orders`,
      });
      paymentData = { paymentUrl: result.paymentUrl };

    } else if (paymentProvider === 'MTN_MOMO') {
      const mtnCountry = country as 'CM' | 'CG';
      const result = await mtnMomoService.requestToPay({
        country: mtnCountry,
        orderId: order.id,
        amount: priceLocal,
        phone: formattedPhone,
        description,
      });
      paymentData = { referenceId: result.referenceId };

    } else if (paymentProvider === 'AIRTEL_MONEY') {
      const airtelCountry = country as 'CD' | 'CG' | 'GA';
      const result = await airtelMoneyService.initiatePayment({
        country: airtelCountry,
        orderId: order.id,
        amount: priceLocal,
        phone: formattedPhone,
        description,
      });
      paymentData = { txId: result.transactionId, referenceId: result.referenceId };
    }

    // Créer le paiement en DB
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        provider: paymentProvider as any,
        status: 'PENDING',
        amount: priceLocal,
        currency,
        paymentPhone: formattedPhone,
        providerRef: paymentData.referenceId,
        ussdPushSent: true,
      },
    });

    // Mettre à jour le statut de la commande
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAYMENT_INITIATED' },
    });

    res.status(201).json({
      success: true,
      message: 'Commande créée. Validez le paiement sur votre téléphone.',
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: 'PAYMENT_INITIATED',
          amountLocal: priceLocal,
          currency,
          product: { name: product.name, service: product.service },
        },
        payment: { id: payment.id, provider: paymentProvider },
        paymentUrl: paymentData.paymentUrl,
        message: 'Un USSD push a été envoyé sur votre téléphone. Entrez votre PIN pour confirmer.',
      },
    });
  } catch (err) {
    console.error('[Order] Create error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la commande' });
  }
}

export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { product: true, payment: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const safeOrders = orders.map((o) => ({
      ...o,
      activationCode: o.activationCode ? '****' + o.activationCode.slice(-4) : null,
    }));

    res.json({ success: true, data: safeOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { product: true, payment: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Commande non trouvée' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}

// Traitement post-paiement: activation immédiate via Reloadly
export async function processOrderActivation(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, user: true, payment: true },
  });

  if (!order || order.status !== 'PAYMENT_CONFIRMED') return;

  await prisma.order.update({ where: { id: orderId }, data: { status: 'PROCESSING' } });

  try {
    const result = await reloadlyService.purchaseGiftCard({
      service: order.product.service,
      amountUSD: order.amountUSD,
      orderId: order.orderNumber,
      userEmail: order.user.email || undefined,
      userPhone: order.user.phone,
      countryCode: order.country,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        activationCode: result.cardNumber,
        pinCode: result.pinCode,
        redeemUrl: result.redemptionUrl,
        reloadlyTxId: String(result.reloadlyTxId),
        completedAt: new Date(),
      },
    });

    await notificationService.notifyOrderCompleted({
      pushToken: order.user.pushToken || undefined,
      phone: order.user.phone,
      service: order.product.service,
      activationCode: result.cardNumber,
      redeemUrl: result.redemptionUrl,
      orderNumber: order.orderNumber,
    });

    await prisma.transactionLog.create({
      data: {
        type: 'ORDER_COMPLETED',
        orderId,
        userId: order.userId,
        data: { reloadlyTxId: result.reloadlyTxId, service: order.product.service },
      },
    });
  } catch (err) {
    console.error('[Order] Activation failed:', err);
    await prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } });
    await notificationService.notifyPaymentFailed({
      pushToken: order.user.pushToken || undefined,
      phone: order.user.phone,
      orderNumber: order.orderNumber,
    });
  }
}
