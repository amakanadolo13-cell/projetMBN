import prisma from '../../config/database';
import { CountryCode } from '../../config/countries';
import axios from 'axios';

// Taux de change en cache (mis à jour toutes les heures)
let exchangeRates: Record<string, number> = {};
let ratesUpdatedAt = 0;

async function getExchangeRates(): Promise<Record<string, number>> {
  if (Date.now() - ratesUpdatedAt < 3600000 && Object.keys(exchangeRates).length > 0) {
    return exchangeRates;
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const response = await axios.get(
      `${process.env.EXCHANGE_RATE_API_URL}/${apiKey}/latest/USD`
    );
    exchangeRates = response.data.conversion_rates;
    ratesUpdatedAt = Date.now();
  } catch {
    // Fallback avec taux statiques si l'API échoue
    exchangeRates = {
      CDF: 2800,
      XAF: 610,
      XOF: 610,
      USD: 1,
    };
  }

  return exchangeRates;
}

// Catalogue des abonnements disponibles
export const SUBSCRIPTION_CATALOG = [
  // NETFLIX
  {
    service: 'NETFLIX',
    name: 'Netflix Standard',
    description: 'Accès illimité à tout le contenu Netflix en HD. 2 écrans simultanés.',
    durationDays: 30,
    priceUSD: 15.49,
    reloadlyProductId: 10,
    deepLinkIOS: 'nflx://netflix.com/redeem',
    deepLinkAndroid: 'nflx://netflix.com/redeem',
    redeemUrl: 'https://www.netflix.com/redeem',
    iconUrl: 'https://cdn.subpay.africa/icons/netflix.png',
  },
  {
    service: 'NETFLIX',
    name: 'Netflix Premium',
    description: 'Accès Netflix en 4K Ultra HD. 4 écrans simultanés.',
    durationDays: 30,
    priceUSD: 22.99,
    reloadlyProductId: 10,
    deepLinkIOS: 'nflx://netflix.com/redeem',
    deepLinkAndroid: 'nflx://netflix.com/redeem',
    redeemUrl: 'https://www.netflix.com/redeem',
    iconUrl: 'https://cdn.subpay.africa/icons/netflix.png',
  },

  // SPOTIFY
  {
    service: 'SPOTIFY',
    name: 'Spotify Premium 1 mois',
    description: 'Écoute musicale sans publicité, téléchargement hors ligne, qualité audio haute.',
    durationDays: 30,
    priceUSD: 9.99,
    reloadlyProductId: 1839,
    deepLinkIOS: 'spotify://redeem',
    deepLinkAndroid: 'spotify://redeem',
    redeemUrl: 'https://www.spotify.com/redeem',
    iconUrl: 'https://cdn.subpay.africa/icons/spotify.png',
  },
  {
    service: 'SPOTIFY',
    name: 'Spotify Premium 3 mois',
    description: 'Profitez de 3 mois de Spotify Premium sans interruption.',
    durationDays: 90,
    priceUSD: 29.97,
    reloadlyProductId: 1839,
    deepLinkIOS: 'spotify://redeem',
    deepLinkAndroid: 'spotify://redeem',
    redeemUrl: 'https://www.spotify.com/redeem',
    iconUrl: 'https://cdn.subpay.africa/icons/spotify.png',
  },

  // APPLE MUSIC
  {
    service: 'APPLE_MUSIC',
    name: 'Apple Music 1 mois',
    description: 'Accès à plus de 100 millions de titres. Téléchargement et écoute hors ligne.',
    durationDays: 30,
    priceUSD: 10.99,
    reloadlyProductId: 12,
    deepLinkIOS: 'itms-apps://apps.apple.com/redeem',
    deepLinkAndroid: 'https://apps.apple.com/redeem',
    redeemUrl: 'https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/redeemGiftCode',
    iconUrl: 'https://cdn.subpay.africa/icons/apple-music.png',
  },
  {
    service: 'APPLE_MUSIC',
    name: 'iTunes Gift Card $25',
    description: 'Carte cadeau Apple pour acheter musique, apps, films sur l\'App Store.',
    durationDays: 365,
    priceUSD: 25.0,
    reloadlyProductId: 12,
    deepLinkIOS: 'itms-apps://apps.apple.com/redeem',
    deepLinkAndroid: 'https://apps.apple.com/redeem',
    redeemUrl: 'https://buy.itunes.apple.com/WebObjects/MZFinance.woa/wa/redeemGiftCode',
    iconUrl: 'https://cdn.subpay.africa/icons/apple-music.png',
  },

  // PSN
  {
    service: 'PSN',
    name: 'PSN $10 — Wallet Recharge',
    description: 'Rechargez votre portefeuille PlayStation Network avec $10.',
    durationDays: 365,
    priceUSD: 10.0,
    reloadlyProductId: 532,
    deepLinkIOS: 'com.playstation.remoteplay://',
    deepLinkAndroid: 'com.playstation.mobileshop://',
    redeemUrl: 'https://store.playstation.com/redeem',
    iconUrl: 'https://cdn.subpay.africa/icons/psn.png',
  },
  {
    service: 'PSN',
    name: 'PSN $20 — Wallet Recharge',
    description: 'Rechargez votre portefeuille PlayStation Network avec $20.',
    durationDays: 365,
    priceUSD: 20.0,
    reloadlyProductId: 532,
    deepLinkIOS: 'com.playstation.remoteplay://',
    deepLinkAndroid: 'com.playstation.mobileshop://',
    redeemUrl: 'https://store.playstation.com/redeem',
    iconUrl: 'https://cdn.subpay.africa/icons/psn.png',
  },
];

export async function getProductsForCountry(country: CountryCode) {
  const rates = await getExchangeRates();
  const products = await prisma.subscriptionProduct.findMany({
    where: { isActive: true },
    include: {
      pricings: {
        where: { country, isActive: true },
      },
    },
    orderBy: [{ service: 'asc' }, { priceUSD: 'asc' }],
  });

  return products.map((product) => {
    const pricing = product.pricings[0];
    let priceLocal = pricing?.priceLocal;
    let currency = pricing?.currency;

    // Calculer le prix local si pas de pricing configuré
    if (!priceLocal) {
      const countryCurrencies: Record<CountryCode, string> = {
        CD: 'CDF',
        CG: 'XAF',
        GA: 'XAF',
        CM: 'XAF',
        BF: 'XOF',
      };
      currency = countryCurrencies[country];
      const rate = rates[currency] || 1;
      priceLocal = Math.ceil(product.priceUSD * rate * 1.15); // 15% marge
    }

    return {
      ...product,
      priceLocal,
      currency,
      pricings: undefined,
    };
  });
}

export async function seedCatalog() {
  for (const item of SUBSCRIPTION_CATALOG) {
    await prisma.subscriptionProduct.upsert({
      where: {
        id: `${item.service}-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
      },
      create: {
        id: `${item.service}-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
        service: item.service as any,
        name: item.name,
        description: item.description,
        durationDays: item.durationDays,
        priceUSD: item.priceUSD,
        reloadlyProductId: item.reloadlyProductId,
        deepLinkIOS: item.deepLinkIOS,
        deepLinkAndroid: item.deepLinkAndroid,
        redeemUrl: item.redeemUrl,
        iconUrl: item.iconUrl,
        isActive: true,
      },
      update: {
        priceUSD: item.priceUSD,
        isActive: true,
      },
    });
  }
  console.log('[Catalog] Seeded successfully');
}
