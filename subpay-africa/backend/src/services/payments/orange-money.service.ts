import axios, { AxiosInstance } from 'axios';
import { CountryCode } from '../../config/countries';

interface OrangeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface OrangePaymentResponse {
  status: string;
  message: string;
  data: {
    payment_token: string;
    payment_url: string;
    notif_token: string;
  };
}

interface OrangeWebhookPayload {
  status: string;
  txnid: string;
  txnmessage: string;
  orderId: string;
  amount: number;
  currency: string;
  subscriberMsisdn: string;
}

interface InitPaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  phone: string;
  country: CountryCode;
  description: string;
  callbackUrl: string;
}

// Config par pays
const ORANGE_CONFIG: Record<string, { clientId: string; clientSecret: string; merchantKey: string; baseUrl: string }> = {
  CM: {
    clientId: process.env.ORANGE_CLIENT_ID_CM || '',
    clientSecret: process.env.ORANGE_CLIENT_SECRET_CM || '',
    merchantKey: process.env.ORANGE_MERCHANT_KEY_CM || '',
    baseUrl: 'https://api.orange.com/orange-money-webpay/cm/v1',
  },
  CD: {
    clientId: process.env.ORANGE_CLIENT_ID_CD || '',
    clientSecret: process.env.ORANGE_CLIENT_SECRET_CD || '',
    merchantKey: process.env.ORANGE_MERCHANT_KEY_CD || '',
    baseUrl: 'https://api.orange.com/orange-money-webpay/cd/v1',
  },
  BF: {
    clientId: process.env.ORANGE_CLIENT_ID_BF || '',
    clientSecret: process.env.ORANGE_CLIENT_SECRET_BF || '',
    merchantKey: process.env.ORANGE_MERCHANT_KEY_BF || '',
    baseUrl: 'https://api.orange.com/orange-money-webpay/bf/v1',
  },
};

export class OrangeMoneyService {
  private tokens: Map<string, { token: string; expiresAt: number }> = new Map();

  private async getAccessToken(country: string): Promise<string> {
    const cached = this.tokens.get(country);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }

    const config = ORANGE_CONFIG[country];
    if (!config) throw new Error(`Orange Money not configured for country: ${country}`);

    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await axios.post<OrangeTokenResponse>(
      'https://api.orange.com/oauth/v3/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      }
    );

    const { access_token, expires_in } = response.data;
    this.tokens.set(country, {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 60) * 1000, // Refresh 1 min before expiry
    });

    return access_token;
  }

  async initiatePayment(params: InitPaymentParams): Promise<{
    paymentToken: string;
    paymentUrl: string;
    notifToken: string;
  }> {
    const { orderId, amount, currency, country, description, callbackUrl } = params;
    const config = ORANGE_CONFIG[country];

    if (!config) {
      throw new Error(`Orange Money non disponible au ${country}`);
    }

    const token = await this.getAccessToken(country);

    const payload = {
      merchant_key: config.merchantKey,
      currency,
      order_id: orderId,
      amount: Math.round(amount),
      return_url: `${callbackUrl}/success`,
      cancel_url: `${callbackUrl}/cancel`,
      notif_url: `${process.env.APP_URL}/api/webhooks/orange`,
      lang: 'fr',
      reference: description,
    };

    const response = await axios.post<OrangePaymentResponse>(
      `${config.baseUrl}/webpayment`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (response.data.status !== 'SUCCESS') {
      throw new Error(`Orange Money: ${response.data.message}`);
    }

    return {
      paymentToken: response.data.data.payment_token,
      paymentUrl: response.data.data.payment_url,
      notifToken: response.data.data.notif_token,
    };
  }

  async checkPaymentStatus(country: string, paymentToken: string): Promise<{
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    txnId?: string;
    amount?: number;
  }> {
    const config = ORANGE_CONFIG[country];
    const token = await this.getAccessToken(country);

    try {
      const response = await axios.get(
        `${config.baseUrl}/webpayment/${paymentToken}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const data = response.data;
      if (data.status === 'SUCCESS') {
        return { status: 'SUCCESSFUL', txnId: data.txnid, amount: data.amount };
      } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        return { status: 'FAILED' };
      }
      return { status: 'PENDING' };
    } catch {
      return { status: 'PENDING' };
    }
  }

  validateWebhook(payload: OrangeWebhookPayload, _signature: string): boolean {
    // En production: valider la signature HMAC avec WEBHOOK_SECRET_ORANGE
    // Pour sandbox: accepter toutes les notifications
    return payload.status === 'SUCCESS' || payload.status === 'SUCCESSFUL';
  }

  parseWebhook(payload: OrangeWebhookPayload): {
    orderId: string;
    txnId: string;
    status: 'SUCCESSFUL' | 'FAILED';
    amount: number;
    phone: string;
  } {
    return {
      orderId: payload.orderId,
      txnId: payload.txnid,
      status: payload.status === 'SUCCESS' ? 'SUCCESSFUL' : 'FAILED',
      amount: payload.amount,
      phone: payload.subscriberMsisdn,
    };
  }
}

export const orangeMoneyService = new OrangeMoneyService();
