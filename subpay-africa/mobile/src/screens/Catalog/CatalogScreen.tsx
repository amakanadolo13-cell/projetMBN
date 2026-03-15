import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppDispatch, RootState } from '../../store';
import { fetchCatalog, Product } from '../../store/slices/catalogSlice';
import { Colors, SERVICE_BRANDS } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

const SERVICE_FILTERS = [
  { key: 'ALL', label: 'Tous', emoji: '🌟' },
  { key: 'NETFLIX', label: 'Netflix', emoji: '🎬' },
  { key: 'SPOTIFY', label: 'Spotify', emoji: '🎵' },
  { key: 'APPLE_MUSIC', label: 'Apple Music', emoji: '🎶' },
  { key: 'PSN', label: 'PlayStation', emoji: '🎮' },
];

export default function CatalogScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { products, isLoading } = useSelector((s: RootState) => s.catalog);
  const { user } = useSelector((s: RootState) => s.auth);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    if (user?.country) dispatch(fetchCatalog(user.country));
  }, [user?.country]);

  const filtered = activeFilter === 'ALL'
    ? products
    : products.filter((p) => p.service === activeFilter);

  return (
    <LinearGradient
      colors={isDark ? [Colors.gradientStart, Colors.gradientMid] : ['#F8F7FF', '#EDE9FE']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Services</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Payez avec votre Mobile Money
        </Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {SERVICE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === f.key
                  ? Colors.primary
                  : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderColor: activeFilter === f.key
                  ? Colors.primary
                  : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              },
            ]}
          >
            <Text style={styles.filterEmoji}>{f.emoji}</Text>
            <Text style={[
              styles.filterLabel,
              { color: activeFilter === f.key ? '#FFFFFF' : theme.textSecondary }
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsContent}
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Chargement du catalogue...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>😔</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Aucun service disponible
            </Text>
          </View>
        ) : (
          filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isDark={isDark}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            />
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function ProductCard({
  product, index, isDark, onPress,
}: { product: Product; index: number; isDark: boolean; onPress: () => void }) {
  const theme = isDark ? Colors.dark : Colors.light;
  const brand = SERVICE_BRANDS[product.service];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(500)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.productCard,
          {
            backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
            borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder,
          },
        ]}
      >
        {/* Left: Icon */}
        <View style={[styles.productIconContainer, { backgroundColor: brand?.color + '20' }]}>
          <Text style={styles.productEmoji}>{brand?.emoji || '📱'}</Text>
        </View>

        {/* Middle: Info */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={[styles.productService, { color: brand?.color || Colors.primary }]}>
              {brand?.name}
            </Text>
            <View style={[styles.durationBadge, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.durationText, { color: Colors.primaryLight }]}>
                {product.durationDays === 365 ? '1 an' : `${product.durationDays}j`}
              </Text>
            </View>
          </View>
          <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
          <Text style={[styles.productDesc, { color: theme.textSecondary }]} numberOfLines={2}>
            {product.description}
          </Text>
        </View>

        {/* Right: Price + CTA */}
        <View style={styles.productPricing}>
          <Text style={[styles.price, { color: theme.text }]}>
            {product.priceLocal?.toLocaleString()}
          </Text>
          <Text style={[styles.currency, { color: theme.textSecondary }]}>{product.currency}</Text>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.buyButton}
          >
            <Text style={styles.buyButtonText}>Acheter</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  filtersContainer: { maxHeight: 52, marginBottom: 8 },
  filtersContent: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    gap: 6,
  },
  filterEmoji: { fontSize: 16 },
  filterLabel: { fontSize: 13, fontWeight: '600' },
  productsContent: { paddingHorizontal: 20, paddingBottom: 100 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16 },

  productCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
    alignItems: 'center',
  },
  productIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: { fontSize: 28 },
  productInfo: { flex: 1 },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  productService: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  durationBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  durationText: { fontSize: 11, fontWeight: '600' },
  productName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  productDesc: { fontSize: 12, lineHeight: 17 },
  productPricing: { alignItems: 'flex-end', gap: 2 },
  price: { fontSize: 18, fontWeight: '800' },
  currency: { fontSize: 11, fontWeight: '500' },
  buyButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginTop: 6 },
  buyButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
