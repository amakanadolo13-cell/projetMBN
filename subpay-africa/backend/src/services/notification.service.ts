import axios from 'axios';

interface PushNotification {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  badge?: number;
}

export class NotificationService {
  // Expo Push Notifications
  async sendPushNotification(notification: PushNotification): Promise<void> {
    try {
      await axios.post(
        'https://exp.host/--/api/v2/push/send',
        {
          ...notification,
          sound: 'default',
        },
        {
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
          },
        }
      );
    } catch (err) {
      console.error('[Push] Failed to send notification:', err);
    }
  }

  // SMS via Africa's Talking
  async sendSMS(phone: string, message: string): Promise<void> {
    try {
      const params = new URLSearchParams({
        username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox',
        to: phone,
        message,
        from: 'SubPay',
      });

      await axios.post(
        'https://api.africastalking.com/version1/messaging',
        params.toString(),
        {
          headers: {
            apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        }
      );
    } catch (err) {
      console.error('[SMS] Failed to send:', err);
    }
  }

  async notifyOrderCompleted(params: {
    pushToken?: string;
    phone: string;
    service: string;
    activationCode: string;
    redeemUrl: string;
    orderNumber: string;
  }): Promise<void> {
    const { pushToken, phone, service, activationCode, orderNumber } = params;

    const serviceNames: Record<string, string> = {
      NETFLIX: 'Netflix',
      SPOTIFY: 'Spotify',
      APPLE_MUSIC: 'Apple Music',
      PSN: 'PlayStation',
    };

    const serviceName = serviceNames[service] || service;

    // Push notification
    if (pushToken) {
      await this.sendPushNotification({
        to: pushToken,
        title: `✅ ${serviceName} activé !`,
        body: `Votre abonnement est prêt. Touchez pour activer maintenant.`,
        data: {
          type: 'ORDER_COMPLETED',
          orderNumber,
          activationCode,
          service,
        },
      });
    }

    // SMS de confirmation
    const smsMessage =
      `SubPay Africa - Commande ${orderNumber}\n` +
      `Votre ${serviceName} est activé!\n` +
      `Code: ${activationCode}\n` +
      `Activez sur: ${params.redeemUrl}`;

    await this.sendSMS(phone, smsMessage);
  }

  async notifyPaymentReceived(params: {
    pushToken?: string;
    phone: string;
    amount: number;
    currency: string;
    orderNumber: string;
  }): Promise<void> {
    const { pushToken, phone, amount, currency, orderNumber } = params;
    const formattedAmount = `${amount.toLocaleString()} ${currency}`;

    if (pushToken) {
      await this.sendPushNotification({
        to: pushToken,
        title: '💳 Paiement reçu',
        body: `${formattedAmount} reçu. Activation en cours...`,
        data: { type: 'PAYMENT_RECEIVED', orderNumber },
      });
    }

    await this.sendSMS(
      phone,
      `SubPay Africa - Paiement de ${formattedAmount} reçu pour commande ${orderNumber}. Activation en cours...`
    );
  }

  async notifyPaymentFailed(params: {
    pushToken?: string;
    phone: string;
    orderNumber: string;
    reason?: string;
  }): Promise<void> {
    const { pushToken, phone, orderNumber } = params;

    if (pushToken) {
      await this.sendPushNotification({
        to: pushToken,
        title: '❌ Paiement échoué',
        body: 'Votre paiement n\'a pas abouti. Veuillez réessayer.',
        data: { type: 'PAYMENT_FAILED', orderNumber },
      });
    }

    await this.sendSMS(
      phone,
      `SubPay Africa - Le paiement pour ${orderNumber} a échoué. Contactez le support ou réessayez.`
    );
  }
}

export const notificationService = new NotificationService();
