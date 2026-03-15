import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence,
} from 'react-native-reanimated';

import { AppDispatch, RootState } from '../../store';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { Colors, SERVICE_BRANDS, OPERATOR_BRANDS } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

const SERVICES = ['NETFLIX', 'SPOTIFY', 'APPLE_MUSIC', 'PSN'] as const;

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { orders } = useSelector((s: RootState) => s.orders);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  const [refreshing, setRefreshing] = React.useState(false);

  const pulseAnim = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 1.4 - pulseAnim.value,
  }));

  useEffect(() => {
    dispatch(fetchOrders());
    pulseAnim.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 1500 }), withTiming(1, { duration: 1500 })),
      -1
    );
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await dispatch(fetchOrders());
    setRefreshing(false);
  }

  const recentOrders = orders.slice(0, 3);
  const greeting = new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <LinearGradient
      colors={isDark ? [Colors.gradientStart, Colors.gradientMid] : ['#F8F7FF', '#EDE9FE']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting} 👋</Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.firstName ? `${user.firstName}` : 'Bienvenue'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile' as any)}
            style={[styles.avatarButton, { backgroundColor: Colors.primary + '20', borderColor: Colors.primary + '50' }]}
          >
            <Text style={styles.avatarText}>
              {(user?.firstName?.[0] || user?.phone?.[0] || 'U').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Banner */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.heroBanner}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBannerGradient}
          >
            {/* Glow */}
            <Animated.View style={[styles.heroGlow, pulseStyle]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Activez en 30 secondes</Text>
              <Text style={styles.heroSubtitle}>Netflix, Spotify, Apple Music & PSN via Mobile Money</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Catalog' as any)}
                style={styles.heroButton}
                activeOpacity={0.85}
              >
                <Text style={styles.heroButtonText}>Voir les services →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.heroEmoji}>⚡</Text>
          </LinearGradient>
        </Animated.View>

        {/* Quick Services Grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Services populaires</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map((service, index) => {
              const brand = SERVICE_BRANDS[service];
              return (
                <Animated.View key={service} entering={FadeInRight.delay(index * 80).duration(500)}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Catalog' as any)}
                    activeOpacity={0.85}
                    style={[
                      styles.serviceCard,
                      {
                        backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                        borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder,
                      },
                    ]}
                  >
                    <Text style={styles.serviceEmoji}>{brand.emoji}</Text>
                    <Text style={[styles.serviceName, { color: theme.text }]}>{brand.name}</Text>
                    <Text style={[styles.serviceDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                      {brand.description}
                    </Text>
                    <View style={[styles.serviceTag, { backgroundColor: brand.color + '20' }]}>
                      <Text style={[styles.serviceTagText, { color: brand.color }]}>Disponible</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Commandes récentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Orders' as any)}>
                <Text style={[styles.seeAll, { color: Colors.primaryLight }]}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {recentOrders.map((order) => {
              const brand = SERVICE_BRANDS[order.product.service as keyof typeof SERVICE_BRANDS];
              const isCompleted = order.status === 'COMPLETED';
              return (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                  activeOpacity={0.85}
                  style={[
                    styles.orderCard,
                    {
                      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
                      borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder,
                    },
                  ]}
                >
                  <View style={[styles.orderIcon, { backgroundColor: brand?.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{brand?.emoji}</Text>
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderName, { color: theme.text }]}>{order.product.name}</Text>
                    <Text style={[styles.orderNumber, { color: theme.textSecondary }]}>{order.orderNumber}</Text>
                  </View>
                  <View>
                    <Text style={[styles.orderAmount, { color: theme.text }]}>
                      {order.amountLocal.toLocaleString()} {order.currency}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: isCompleted ? Colors.success + '20' : Colors.warning + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: isCompleted ? Colors.success : Colors.warning }
                      ]}>
                        {isCompleted ? '✅ Activé' : '⏳ En cours'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}

        {/* Mobile Money badge */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.paymentBadges}>
          <Text style={[styles.paymentTitle, { color: theme.textSecondary }]}>Méthodes de paiement acceptées</Text>
          <View style={styles.operatorsRow}>
            {Object.entries(OPERATOR_BRANDS).map(([key, op]) => (
              <View key={key} style={[styles.operatorBadge, { backgroundColor: op.color + '20' }]}>
                <Text style={[styles.operatorName, { color: op.color }]}>{op.name.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60, paddingBottom: 100, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  avatarButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.primary, fontSize: 18, fontWeight: '700' },

  heroBanner: { marginBottom: 28, borderRadius: 24, overflow: 'hidden' },
  heroBannerGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 140,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#FFFFFF', opacity: 0.05, top: -60, right: -60,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  heroButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  heroEmoji: { fontSize: 56, marginLeft: 12 },

  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { fontSize: 14, fontWeight: '600' },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  serviceCard: {
    width: '47%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  serviceEmoji: { fontSize: 32 },
  serviceName: { fontSize: 15, fontWeight: '700' },
  serviceDesc: { fontSize: 12, lineHeight: 16 },
  serviceTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  serviceTagText: { fontSize: 11, fontWeight: '600' },

  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  orderIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  orderNumber: { fontSize: 12 },
  orderAmount: { fontSize: 14, fontWeight: '700', textAlign: 'right', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },

  paymentBadges: { marginTop: 8, marginBottom: 20 },
  paymentTitle: { fontSize: 13, marginBottom: 12, textAlign: 'center' },
  operatorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  operatorBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  operatorName: { fontSize: 12, fontWeight: '700' },
});
