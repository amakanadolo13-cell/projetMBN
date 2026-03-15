import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { store } from '../store';
import { updateOrderStatus } from '../store/slices/ordersSlice';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string, accessToken: string) {
    if (this.socket?.connected) return;

    this.socket = io(API_URL, {
      auth: { userId, token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    // Événement: commande complétée avec le code d'activation
    this.socket.on('order:completed', (data: {
      orderId: string;
      activationCode: string;
      pinCode?: string;
      redeemUrl: string;
      service: string;
    }) => {
      store.dispatch(updateOrderStatus({
        orderId: data.orderId,
        status: 'COMPLETED',
        activationCode: data.activationCode,
        pinCode: data.pinCode,
        redeemUrl: data.redeemUrl,
      }));
    });

    // Événement: paiement confirmé, activation en cours
    this.socket.on('payment:confirmed', (data: { orderId: string }) => {
      store.dispatch(updateOrderStatus({ orderId: data.orderId, status: 'PAYMENT_CONFIRMED' }));
    });

    // Événement: échec paiement
    this.socket.on('payment:failed', (data: { orderId: string }) => {
      store.dispatch(updateOrderStatus({ orderId: data.orderId, status: 'FAILED' }));
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
