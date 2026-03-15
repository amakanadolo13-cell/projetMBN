import { configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import authReducer from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';
import catalogReducer from './slices/catalogSlice';
import themeReducer from './slices/themeSlice';
import { DEMO_PRODUCTS } from './slices/catalogSlice';

// Persist auth + catalog on web via localStorage
function loadWebState() {
  if (Platform.OS !== 'web') return undefined;
  try {
    const raw = localStorage.getItem('subpay_state');
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function saveWebState(state: any) {
  if (Platform.OS !== 'web') return;
  try {
    localStorage.setItem('subpay_state', JSON.stringify({
      auth: state.auth,
      catalog: state.catalog,
      theme: state.theme,
    }));
  } catch {}
}

const preloaded = loadWebState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    catalog: catalogReducer,
    theme: themeReducer,
  },
  preloadedState: preloaded,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Subscribe to save state on web
store.subscribe(() => {
  saveWebState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
