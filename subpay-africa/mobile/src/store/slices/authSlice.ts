import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../../services/api.service';

export interface User {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  country: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { phone: string; password: string; country: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      return { user, accessToken };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur de connexion');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    data: { phone: string; password: string; firstName: string; lastName: string; country: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post('/auth/register', data);
      const { user, accessToken, refreshToken } = response.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      return { user, accessToken };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur d\'inscription');
    }
  }
);

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (!accessToken) return rejectWithValue('No session');

    const response = await apiService.get('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return { user: response.data.data, accessToken };
  } catch {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    return rejectWithValue('Session expired');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    loginDemo: (state) => {
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.accessToken = 'demo-token';
      state.user = {
        id: 'demo-user',
        phone: '+237600000000',
        firstName: 'Utilisateur',
        lastName: 'Démo',
        country: 'CM',
        role: 'USER',
      };
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Restore session
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
    });
  },
});

export const { clearError, setUser, loginDemo } = authSlice.actions;
export default authSlice.reducer;
