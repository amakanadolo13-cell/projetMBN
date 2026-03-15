import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppDispatch, RootState } from '../../store';
import { fetchOrders, Order } from '../../store/slices/ordersSlice';
import { Colors, SERVICE_BRANDS } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'En attente', color: Colors.warning, icon: '⏳' },
  PAYMENT_INITIATED: { label: 'Paiement initié', color: Colors.info, icon: '📲' },
  PAYMENT_CONFIRMED: { label: 'Paiement confirmé', color: Colors.secondary, icon: '💳' },
  PROCESSING: { label: 'Activation...', color: Colors.primary, icon: '⚡' },
  COMPLETED: { label: 'Activé', color: Colors.success, icon: '✅' },
  FAILED: { label: 'Échoué', color: Colors.error, icon: '❌' },
  CANCELLED: { label: 'Annulé', color: Colors.error, icon: '🚫' },
};

export default function OrdersScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { orders, isLoading } = useSelector((s: RootState) => s.orders);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await dispatch(fetchOrders());
    setRefreshing(false);
  }

  return (
    <LinearGradient
      colors={isDark ? [Colors.gradientStart, Colors.gradientMid] : ['#F8F7FF', '#EDE9FE']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mes commandes</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {orders.length} commande{orders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune commande</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Vos commandes apparaîtront ici
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <OrderCard
            order={item}
            index={index}
            isDark={isDark}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
      />
    </LinearGradient>
  );
}

function OrderCard({
  order, index, isDark, onPress,
}: { order: Order; index: number; isDark: boolean; onPress: () => void }) {
  const theme = isDark ? Colors.dark : Colors.light;
  const brand = SERVICE_BRANDS[order.product.service as keyof typeof SERVICE_BRANDS];
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.orderCard,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder,
          },
        ]}
      >
        {/* Left icon */}
        <View style={[styles.orderIcon, { backgroundColor: brand?.color + '20' }]}>
          <Text style={{ fontSize: 28 }}>{brand?.emoji || '📱'}</Text>
        </View>

        {/* Info */}
        <View style={styles.orderInfo}>
          <View style={styles.orderTopRow}>
            <Text style={[styles.orderName, { color: theme.text }]} numberOfLines={1}>
              {order.product.name}
            </Text>
            <Text style={[styles.orderAmount, { color: theme.text }]}>
              {order.amountLocal.toLocaleString()} {order.currency}
            </Text>
          </View>

          <View style={styles.orderBottomRow}>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.icon} {status.label}
              </Text>
            </View>
            <Text style={[styles.orderDate, { color: theme.textMuted }]}>{date}</Text>
          </View>

          <Text style={[styles.orderNumber, { color: theme.textMuted }]}>
            {order.orderNumber}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptySubtitle: { fontSize: 14 },

  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  orderIcon: { width: 54, height: 54, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  orderInfo: { flex: 1, gap: 4 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  orderAmount: { fontSize: 15, fontWeight: '700' },
  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 11 },
  orderNumber: { fontSize: 11 },
});
