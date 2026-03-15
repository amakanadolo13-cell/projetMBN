import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

type MTNCountry = 'CM' | 'CG';

interface MTNConfig {
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
  currency: string;
}

interface MTNTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MTNPaymentStatus {
  financialTransactionId?: string;
  externalId: string;
  amount: string;
  currency: string;
  payer: { partyIdType: string; partyId: string };
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: { code: string; message: string };
}

const MTN_CONFIG: Record<MTNCountry, MTNConfig> = {
  CM: {
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY_COLLECTION_CM || '',
    apiUser: process.env.MTN_API_USER_CM || '',
    apiKey: process.env.MTN_API_KEY_CM || '',
    currency: 'XAF',
  },
  CG: {
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY_COLLECTION_CG || '',
    apiUser: process.env.MTN_API_USER_CG || '',
    apiKey: process.env.MTN_API_KEY_CG || '',
    currency: 'XAF',
  },
};

const MTN_BASE_URL = process.env.MTN_API_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const TARGET_ENV = process.env.MTN_TARGET_ENV || 'sandbox';

export class MTNMomoService {
  private tokens: Map<string, { token: string; expiresAt: number }> = new Map();

  private async getAccessToken(country: MTNCountry): Promise<string> {
    const cached = this.tokens.get(country);
    if (cached && cached.expiresAt > Date.now()) return cached.token;

    const config = MTN_CONFIG[country];
    const credentials = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString('base64');

    const response = await axios.post<MTNTokenResponse>(
      `${MTN_BASE_URL}/collection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
      }
    );

    const { access_token, expires_in } = response.data;
    this.tokens.set(country, {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 60) * 1000,
    });

    return access_token;
  }

  async requestToPay(params: {
    country: MTNCountry;
    orderId: string;
    amount: number;
    phone: string;
    description: string;
  }): Promise<{ referenceId: string }> {
    const { country, orderId, amount, phone, description } = params;
    const config = MTN_CONFIG[country];
    const token = await this.getAccessToken(country);
    const referenceId = uuidv4();

    // Nettoyer le numéro (retirer le +)
    const msisdn = phone.replace(/^\+/, '');

    await axios.post(
      `${MTN_BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: String(Math.round(amount)),
        currency: config.currency,
        externalId: orderId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: msisdn,
        },
        payerMessage: description,
        payeeNote: `SubPay Africa - ${description}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': TARGET_ENV,
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return { referenceId };
  }

  async getPaymentStatus(country: MTNCountry, referenceId: string): Promise<MTNPaymentStatus> {
    const config = MTN_CONFIG[country];
    const token = await this.getAccessToken(country);

    const response = await axios.get<MTNPaymentStatus>(
      `${MTN_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Target-Environment': TARGET_ENV,
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
      }
    );

    return response.data;
  }

  async pollUntilComplete(
    country: MTNCountry,
    referenceId: string,
    maxAttempts = 20,
    intervalMs = 3000
  ): Promise<{ status: 'SUCCESSFUL' | 'FAILED'; txnId?: string }> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      const status = await this.getPaymentStatus(country, referenceId);

      if (status.status === 'SUCCESSFUL') {
        return { status: 'SUCCESSFUL', txnId: status.financialTransactionId };
      }
      if (status.status === 'FAILED') {
        return { status: 'FAILED' };
      }
    }
    return { status: 'FAILED' };
  }
}

export const mtnMomoService = new MTNMomoService();
