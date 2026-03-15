import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api.service';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  amountLocal: number;
  currency: string;
  activationCode?: string;
  pinCode?: string;
  redeemUrl?: string;
  completedAt?: string;
  createdAt: string;
  product: {
    id: string;
    service: string;
    name: string;
    iconUrl?: string;
    deepLinkIOS?: string;
    deepLinkAndroid?: string;
  };
}

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isCreating: false,
  error: null,
};

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiService.get('/orders');
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Erreur de chargement');
  }
});

export const createOrder = createAsyncThunk(
  'orders/create',
  async (
    data: { productId: string; paymentProvider: string; paymentPhone: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiService.post('/orders', data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur de commande');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await apiService.get(`/orders/${orderId}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue('Commande introuvable');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setCurrentOrder: (state, action) => { state.currentOrder = action.payload; },
    updateOrderStatus: (state, action) => {
      const { orderId, status, activationCode, pinCode, redeemUrl } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = status;
        if (activationCode) order.activationCode = activationCode;
        if (pinCode) order.pinCode = pinCode;
        if (redeemUrl) order.redeemUrl = redeemUrl;
      }
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
        if (activationCode) state.currentOrder.activationCode = activationCode;
        if (pinCode) state.currentOrder.pinCode = pinCode;
        if (redeemUrl) state.currentOrder.redeemUrl = redeemUrl;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createOrder.pending, (state) => { state.isCreating = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  },
});

export const { clearError, setCurrentOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
