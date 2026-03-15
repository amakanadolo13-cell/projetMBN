import axios from 'axios';

interface ReloadlyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ReloadlyProduct {
  productId: number;
  productName: string;
  countryCode: string;
  denomination: {
    type: 'FIXED' | 'RANGE';
    fixedList?: number[];
    min?: number;
    max?: number;
  };
  redeemInstructionUrl?: string;
  brand: { brandId: number; brandName: string };
}

interface ReloadlyOrderResponse {
  transactionId: number;
  status: string;
  product: { productId: number; productName: string };
  smsSent: boolean;
  rewards: Array<{
    cards: Array<{
      cardNumber: string;
      pinCode?: string;
      redemptionURL?: string;
      expiryDate?: string;
    }>;
  }>;
}

interface PurchaseResult {
  cardNumber: string;
  pinCode?: string;
  redemptionUrl: string;
  reloadlyTxId: number;
  deepLinkIOS: string;
  deepLinkAndroid: string;
}

const BASE_URL = process.env.RELOADLY_BASE_URL || 'https://giftcards-sandbox.reloadly.com';
const AUTH_URL = process.env.RELOADLY_AUTH_URL || 'https://auth.reloadly.com/oauth/token';

// Deep links par service
const DEEP_LINKS: Record<string, { ios: string; android: string; web: string }> = {
  NETFLIX: {
    ios: 'nflx://netflix.com/redeem',
    android: 'nflx://netflix.com/redeem',
    web: 'https://www.netflix.com/redeem',
  },
  SPOTIFY: {
    ios: 'spotify://redeem',
    android: 'spotify://redeem',
    web: 'https://www.spotify.com/redeem',
  },
  APPLE_MUSIC: {
    ios: 'itms-apps://apps.apple.com/redeem',
    android: 'https://apps.apple.com/redeem',
    web: 'https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/redeemGiftCode',
  },
  PSN: {
    ios: 'com.playstation.remoteplay://',
    android: 'com.playstation.mobileshop://',
    web: 'https://store.playstation.com/redeem',
  },
};

// Product IDs Reloadly
const PRODUCT_IDS: Record<string, number> = {
  NETFLIX: parseInt(process.env.RELOADLY_NETFLIX_PRODUCT_ID || '10'),
  SPOTIFY: parseInt(process.env.RELOADLY_SPOTIFY_PRODUCT_ID || '1839'),
  APPLE_MUSIC: parseInt(process.env.RELOADLY_APPLE_MUSIC_PRODUCT_ID || '12'),
  PSN: parseInt(process.env.RELOADLY_PSN_PRODUCT_ID || '532'),
};

export class ReloadlyService {
  private token: { value: string; expiresAt: number } | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now()) {
      return this.token.value;
    }

    const response = await axios.post<ReloadlyTokenResponse>(AUTH_URL, {
      client_id: process.env.RELOADLY_CLIENT_ID,
      client_secret: process.env.RELOADLY_CLIENT_SECRET,
      grant_type: 'client_credentials',
      audience: BASE_URL,
    });

    this.token = {
      value: response.data.access_token,
      expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
    };

    return this.token.value;
  }

  async getProducts(service: string): Promise<ReloadlyProduct[]> {
    const token = await this.getAccessToken();

    const response = await axios.get<{ content: ReloadlyProduct[] }>(
      `${BASE_URL}/products`,
      {
        params: {
          productId: PRODUCT_IDS[service],
          size: 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/com.reloadly.giftcards-v1+json',
        },
      }
    );

    return response.data.content;
  }

  async purchaseGiftCard(params: {
    service: string; // NETFLIX, SPOTIFY, APPLE_MUSIC, PSN
    amountUSD: number;
    orderId: string;
    userEmail?: string;
    userPhone?: string;
    countryCode: string;
  }): Promise<PurchaseResult> {
    const { service, amountUSD, orderId, userEmail, userPhone, countryCode } = params;
    const token = await this.getAccessToken();
    const productId = PRODUCT_IDS[service];

    if (!productId) {
      throw new Error(`Service inconnu: ${service}`);
    }

    const orderPayload: Record<string, unknown> = {
      productId,
      quantity: 1,
      unitPrice: amountUSD,
      customIdentifier: orderId,
      senderName: 'SubPay Africa',
    };

    if (userEmail) {
      orderPayload.recipientEmail = userEmail;
    }

    if (userPhone) {
      orderPayload.recipientPhoneDetails = {
        countryCode,
        phoneNumber: userPhone,
      };
    }

    const response = await axios.post<ReloadlyOrderResponse>(
      `${BASE_URL}/orders`,
      orderPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/com.reloadly.giftcards-v1+json',
        },
      }
    );

    if (response.data.status !== 'SUCCESSFUL') {
      throw new Error(`Reloadly: Échec de l'achat - ${response.data.status}`);
    }

    const card = response.data.rewards?.[0]?.cards?.[0];
    if (!card) {
      throw new Error('Reloadly: Aucun code reçu');
    }

    const links = DEEP_LINKS[service] || {
      ios: card.redemptionURL || '',
      android: card.redemptionURL || '',
      web: card.redemptionURL || '',
    };

    return {
      cardNumber: card.cardNumber,
      pinCode: card.pinCode,
      redemptionUrl: card.redemptionURL || links.web,
      reloadlyTxId: response.data.transactionId,
      deepLinkIOS: links.ios,
      deepLinkAndroid: links.android,
    };
  }

  getDeepLinks(service: string): { ios: string; android: string; web: string } {
    return DEEP_LINKS[service] || { ios: '', android: '', web: '' };
  }
}

export const reloadlyService = new ReloadlyService();
