// Configuration des pays, devises et opérateurs Mobile Money

export type CountryCode = 'CD' | 'CG' | 'GA' | 'CM' | 'BF';
export type PaymentProvider = 'ORANGE_MONEY' | 'MTN_MOMO' | 'AIRTEL_MONEY' | 'MOOV_MONEY' | 'CORIS_MONEY';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  phonePrefix: string;
  phoneLength: number; // Longueur du numéro sans indicatif
  providers: ProviderConfig[];
  timezone: string;
}

export interface ProviderConfig {
  id: PaymentProvider;
  name: string;
  logo: string;
  color: string;
  prefixes: string[]; // Préfixes de numéros associés
  minAmount: number;  // En devise locale
  maxAmount: number;
  isActive: boolean;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  CD: {
    code: 'CD',
    name: 'Congo RDC',
    flag: '🇨🇩',
    currency: {
      code: 'CDF',
      symbol: 'FC',
      name: 'Franc Congolais',
    },
    phonePrefix: '+243',
    phoneLength: 9,
    timezone: 'Africa/Kinshasa',
    providers: [
      {
        id: 'ORANGE_MONEY',
        name: 'Orange Money',
        logo: 'orange-money',
        color: '#FF6600',
        prefixes: ['084', '085', '086', '089'],
        minAmount: 1000,
        maxAmount: 2000000,
        isActive: true,
      },
      {
        id: 'AIRTEL_MONEY',
        name: 'Airtel Money',
        logo: 'airtel-money',
        color: '#FF0000',
        prefixes: ['099', '097', '098'],
        minAmount: 1000,
        maxAmount: 1500000,
        isActive: true,
      },
    ],
  },

  CG: {
    code: 'CG',
    name: 'Congo Brazzaville',
    flag: '🇨🇬',
    currency: {
      code: 'XAF',
      symbol: 'FCFA',
      name: 'Franc CFA CEMAC',
    },
    phonePrefix: '+242',
    phoneLength: 9,
    timezone: 'Africa/Brazzaville',
    providers: [
      {
        id: 'AIRTEL_MONEY',
        name: 'Airtel Money',
        logo: 'airtel-money',
        color: '#FF0000',
        prefixes: ['06', '05'],
        minAmount: 500,
        maxAmount: 1000000,
        isActive: true,
      },
      {
        id: 'MTN_MOMO',
        name: 'MTN Mobile Money',
        logo: 'mtn-momo',
        color: '#FFCC00',
        prefixes: ['04', '06'],
        minAmount: 500,
        maxAmount: 1000000,
        isActive: true,
      },
    ],
  },

  GA: {
    code: 'GA',
    name: 'Gabon',
    flag: '🇬🇦',
    currency: {
      code: 'XAF',
      symbol: 'FCFA',
      name: 'Franc CFA CEMAC',
    },
    phonePrefix: '+241',
    phoneLength: 8,
    timezone: 'Africa/Libreville',
    providers: [
      {
        id: 'AIRTEL_MONEY',
        name: 'Airtel Money',
        logo: 'airtel-money',
        color: '#FF0000',
        prefixes: ['06', '07'],
        minAmount: 1000,
        maxAmount: 2000000,
        isActive: true,
      },
      {
        id: 'MOOV_MONEY',
        name: 'Moov Money',
        logo: 'moov-money',
        color: '#00AAFF',
        prefixes: ['05', '04'],
        minAmount: 1000,
        maxAmount: 1500000,
        isActive: true,
      },
    ],
  },

  CM: {
    code: 'CM',
    name: 'Cameroun',
    flag: '🇨🇲',
    currency: {
      code: 'XAF',
      symbol: 'FCFA',
      name: 'Franc CFA CEMAC',
    },
    phonePrefix: '+237',
    phoneLength: 9,
    timezone: 'Africa/Douala',
    providers: [
      {
        id: 'MTN_MOMO',
        name: 'MTN Mobile Money',
        logo: 'mtn-momo',
        color: '#FFCC00',
        prefixes: ['650', '651', '652', '653', '654', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679'],
        minAmount: 100,
        maxAmount: 5000000,
        isActive: true,
      },
      {
        id: 'ORANGE_MONEY',
        name: 'Orange Money',
        logo: 'orange-money',
        color: '#FF6600',
        prefixes: ['690', '691', '692', '693', '694', '695', '696', '697', '698', '699'],
        minAmount: 100,
        maxAmount: 5000000,
        isActive: true,
      },
    ],
  },

  BF: {
    code: 'BF',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    currency: {
      code: 'XOF',
      symbol: 'FCFA',
      name: 'Franc CFA UEMOA',
    },
    phonePrefix: '+226',
    phoneLength: 8,
    timezone: 'Africa/Ouagadougou',
    providers: [
      {
        id: 'ORANGE_MONEY',
        name: 'Orange Money',
        logo: 'orange-money',
        color: '#FF6600',
        prefixes: ['70', '71', '72', '75', '76'],
        minAmount: 100,
        maxAmount: 2000000,
        isActive: true,
      },
      {
        id: 'MOOV_MONEY',
        name: 'Moov Money',
        logo: 'moov-money',
        color: '#00AAFF',
        prefixes: ['60', '61', '62'],
        minAmount: 100,
        maxAmount: 1500000,
        isActive: true,
      },
      {
        id: 'CORIS_MONEY',
        name: 'Coris Money',
        logo: 'coris-money',
        color: '#006633',
        prefixes: ['20', '25'],
        minAmount: 500,
        maxAmount: 1000000,
        isActive: true,
      },
    ],
  },
};

// Detect provider from phone number
export function detectProvider(phone: string, country: CountryCode): PaymentProvider | null {
  const config = COUNTRIES[country];
  const localNumber = phone.replace(/^\+\d{1,3}/, '').replace(/^0/, '');

  for (const provider of config.providers) {
    if (provider.prefixes.some((prefix) => localNumber.startsWith(prefix))) {
      return provider.id;
    }
  }
  return null;
}

// Get all active providers for a country
export function getCountryProviders(country: CountryCode): ProviderConfig[] {
  return COUNTRIES[country].providers.filter((p) => p.isActive);
}

// Format phone number to international format
export function formatPhone(phone: string, country: CountryCode): string {
  const prefix = COUNTRIES[country].phonePrefix;
  const cleaned = phone.replace(/\s+/g, '').replace(/^0/, '');
  if (cleaned.startsWith('+')) return cleaned;
  return `${prefix}${cleaned}`;
}
