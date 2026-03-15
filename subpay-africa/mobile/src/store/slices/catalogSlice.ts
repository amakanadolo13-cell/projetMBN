import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api.service';

export interface Product {
  id: string;
  service: 'NETFLIX' | 'SPOTIFY' | 'APPLE_MUSIC' | 'PSN';
  name: string;
  description?: string;
  durationDays: number;
  priceUSD: number;
  priceLocal: number;
  currency: string;
  iconUrl?: string;
  deepLinkIOS?: string;
  deepLinkAndroid?: string;
  redeemUrl?: string;
}

interface CatalogState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: CatalogState = {
  products: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

export const fetchCatalog = createAsyncThunk(
  'catalog/fetch',
  async (country: string, { rejectWithValue, getState }) => {
    const state = (getState() as any).catalog;
    // Cache pendant 5 minutes
    if (state.lastFetched && Date.now() - state.lastFetched < 300000 && state.products.length > 0) {
      return state.products;
    }
    try {
      const res = await apiService.get(`/orders/catalog?country=${country}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue('Impossible de charger le catalogue');
    }
  }
);

export const DEMO_PRODUCTS: Product[] = [
  // Prix officiels Netflix Afrique Centrale + 600 FCFA de bénéfice
  { id: 'p1', service: 'NETFLIX', name: 'Netflix Standard', description: 'Prix local Afrique — HD 2 écrans', durationDays: 30, priceUSD: 5.99, priceLocal: 4300, currency: 'XAF', deepLinkIOS: 'nflx://', deepLinkAndroid: 'nflx://', redeemUrl: 'https://netflix.com/redeem' },
  { id: 'p2', service: 'NETFLIX', name: 'Netflix Premium', description: 'Prix local Afrique — 4K 4 écrans', durationDays: 30, priceUSD: 9.99, priceLocal: 6700, currency: 'XAF', deepLinkIOS: 'nflx://', deepLinkAndroid: 'nflx://', redeemUrl: 'https://netflix.com/redeem' },
  // Prix réels Afrique Centrale + 600 FCFA de bénéfice
  { id: 'p3', service: 'SPOTIFY', name: 'Spotify Premium 1 mois', description: 'Prix local Cameroun — sans pub', durationDays: 30, priceUSD: 3.29, priceLocal: 2600, currency: 'XAF', deepLinkIOS: 'spotify://', deepLinkAndroid: 'spotify://', redeemUrl: 'https://spotify.com/redeem' },
  { id: 'p4', service: 'SPOTIFY', name: 'Spotify Premium 3 mois', description: 'Prix local Cameroun — économisez', durationDays: 90, priceUSD: 9.87, priceLocal: 6600, currency: 'XAF', deepLinkIOS: 'spotify://', deepLinkAndroid: 'spotify://', redeemUrl: 'https://spotify.com/redeem' },
  { id: 'p5', service: 'APPLE_MUSIC', name: 'Apple Music 1 mois', description: 'Prix local Cameroun — 100M+ titres', durationDays: 30, priceUSD: 2.99, priceLocal: 2430, currency: 'XAF', deepLinkIOS: 'music://', deepLinkAndroid: 'music://', redeemUrl: 'https://music.apple.com' },
  { id: 'p6', service: 'APPLE_MUSIC', name: 'iTunes Gift Card $25', description: 'Crédits App Store & iTunes', durationDays: 0, priceUSD: 25, priceLocal: 15900, currency: 'XAF', deepLinkIOS: 'itms-apps://', deepLinkAndroid: 'itms-apps://', redeemUrl: 'https://apps.apple.com/redeem' },
  { id: 'p7', service: 'PSN', name: 'PSN Card $10', description: 'Crédits PlayStation Network', durationDays: 0, priceUSD: 10, priceLocal: 6100, currency: 'XAF', deepLinkIOS: 'com.playstation.remoteplay://', deepLinkAndroid: 'com.playstation.remoteplay://', redeemUrl: 'https://store.playstation.com' },
  { id: 'p8', service: 'PSN', name: 'PSN Card $20', description: 'Crédits PlayStation Network', durationDays: 0, priceUSD: 20, priceLocal: 12200, currency: 'XAF', deepLinkIOS: 'com.playstation.remoteplay://', deepLinkAndroid: 'com.playstation.remoteplay://', redeemUrl: 'https://store.playstation.com' },
];

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    loadDemoProducts: (state) => {
      state.products = DEMO_PRODUCTS;
      state.lastFetched = Date.now();
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { loadDemoProducts } = catalogSlice.actions;
export default catalogSlice.reducer;
