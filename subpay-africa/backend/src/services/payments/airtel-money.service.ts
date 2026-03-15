import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

type AirtelCountry = 'CD' | 'CG' | 'GA';

interface AirtelConfig {
  currency: string;
  isoCode: string;
}

interface AirtelTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AirtelPaymentResponse {
  status: {
    code: string;
    message: string;
    result_code: string;
    success: boolean;
  };
  data: {
    transaction: {
      id: string;
      status: string;
      airtel_money_id?: string;
    };
  };
}

const AIRTEL_COUNTRY_CONFIG: Record<AirtelCountry, AirtelConfig> = {
  CD: { currency: 'CDF', isoCode: 'CD' },
  CG: { currency: 'XAF', isoCode: 'CG' },
  GA: { currency: 'XAF', isoCode: 'GA' },
};

const BASE_URL = process.env.AIRTEL_API_BASE_URL || 'https://openapi.airtel.africa';

export class AirtelMoneyService {
  private token: { value: string; expiresAt: number } | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now()) {
      return this.token.value;
    }

    const response = await axios.post<AirtelTokenResponse>(
      `${BASE_URL}/auth/oauth2/token`,
      {
        client_id: process.env.AIRTEL_CLIENT_ID,
        client_secret: process.env.AIRTEL_CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    this.token = {
      value: response.data.access_token,
      expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
    };

    return this.token.value;
  }

  async initiatePayment(params: {
    country: AirtelCountry;
    orderId: string;
    amount: number;
    phone: string;
    description: string;
  }): Promise<{ transactionId: string; referenceId: string }> {
    const { country, orderId, amount, phone } = params;
    const config = AIRTEL_COUNTRY_CONFIG[country];
    const token = await this.getAccessToken();
    const referenceId = uuidv4();

    // Normaliser le numéro (sans indicatif pays)
    const msisdn = phone.replace(/^\+\d{1,3}/, '').replace(/^0/, '');

    const payload = {
      reference: orderId,
      subscriber: {
        country: config.isoCode,
        currency: config.currency,
        msisdn,
      },
      transaction: {
        amount: Math.round(amount),
        country: config.isoCode,
        currency: config.currency,
        id: referenceId,
      },
    };

    const response = await axios.post<AirtelPaymentResponse>(
      `${BASE_URL}/merchant/v1/payments/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Currency': config.currency,
          'X-Country': config.isoCode,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.data.status.success) {
      throw new Error(`Airtel Money: ${response.data.status.message}`);
    }

    return {
      transactionId: response.data.data.transaction.id,
      referenceId,
    };
  }

  async checkStatus(country: AirtelCountry, transactionId: string): Promise<{
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    airtelMoneyId?: string;
  }> {
    const config = AIRTEL_COUNTRY_CONFIG[country];
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${BASE_URL}/standard/v1/payments/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Currency': config.currency,
            'X-Country': config.isoCode,
          },
        }
      );

      const txn = response.data.data?.transaction;
      if (!txn) return { status: 'PENDING' };

      if (txn.status === 'TS') return { status: 'SUCCESSFUL', airtelMoneyId: txn.airtel_money_id };
      if (txn.status === 'TF' || txn.status === 'TA') return { status: 'FAILED' };
      return { status: 'PENDING' };
    } catch {
      return { status: 'PENDING' };
    }
  }

  validateWebhook(payload: {
    transaction: { id: string; status_code: string; airtel_money_id?: string };
  }): boolean {
    return ['TS', 'TF'].includes(payload.transaction.status_code);
  }

  parseWebhook(payload: {
    transaction: { id: string; status_code: string; message?: string; airtel_money_id?: string };
  }): { txnId: string; status: 'SUCCESSFUL' | 'FAILED'; airtelMoneyId?: string } {
    return {
      txnId: payload.transaction.id,
      status: payload.transaction.status_code === 'TS' ? 'SUCCESSFUL' : 'FAILED',
      airtelMoneyId: payload.transaction.airtel_money_id,
    };
  }
}

export const airtelMoneyService = new AirtelMoneyService();
