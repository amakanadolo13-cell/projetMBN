import 'dotenv/config';
import prisma from './config/database';
import { seedCatalog } from './services/subscriptions/catalog.service';

const COUNTRIES_DATA = [
  {
    code: 'CM',
    name: 'Cameroun',
    currency: 'XAF',
    phonePrefix: '+237',
    usdExchangeRate: 610,
    providers: ['ORANGE_MONEY', 'MTN_MOMO'],
  },
  {
    code: 'CD',
    name: 'Congo RDC',
    currency: 'CDF',
    phonePrefix: '+243',
    usdExchangeRate: 2800,
    providers: ['ORANGE_MONEY', 'AIRTEL_MONEY'],
  },
  {
    code: 'CG',
    name: 'Congo-Brazzaville',
    currency: 'XAF',
    phonePrefix: '+242',
    usdExchangeRate: 610,
    providers: ['MTN_MOMO', 'AIRTEL_MONEY'],
  },
  {
    code: 'GA',
    name: 'Gabon',
    currency: 'XAF',
    phonePrefix: '+241',
    usdExchangeRate: 610,
    providers: ['AIRTEL_MONEY'],
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    currency: 'XOF',
    phonePrefix: '+226',
    usdExchangeRate: 610,
    providers: ['ORANGE_MONEY'],
  },
];

async function seedCountries() {
  for (const country of COUNTRIES_DATA) {
    await prisma.country.upsert({
      where: { code: country.code },
      create: {
        code: country.code,
        name: country.name,
        currency: country.currency,
        phonePrefix: country.phonePrefix,
        usdExchangeRate: country.usdExchangeRate,
        providers: country.providers,
        isActive: true,
      },
      update: {
        usdExchangeRate: country.usdExchangeRate,
        providers: country.providers,
        isActive: true,
      },
    });
  }
  console.log('[Seed] Countries seeded successfully');
}

async function main() {
  console.log('[Seed] Starting database seed...');
  await seedCountries();
  await seedCatalog();
  console.log('[Seed] All data seeded successfully ✓');
}

main()
  .catch((e) => {
    console.error('[Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
