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

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
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

export default catalogSlice.reducer;
