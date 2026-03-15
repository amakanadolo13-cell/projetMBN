import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { RootState } from '../../store';
import { Colors, SERVICE_BRANDS, OPERATOR_BRANDS } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type DetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const PROVIDERS_BY_COUNTRY: Record<string, string[]> = {
  CM: ['MTN_MOMO', 'ORANGE_MONEY'],
  CD: ['ORANGE_MONEY', 'AIRTEL_MONEY'],
  CG: ['AIRTEL_MONEY', 'MTN_MOMO'],
  GA: ['AIRTEL_MONEY', 'MOOV_MONEY'],
  BF: ['ORANGE_MONEY', 'MOOV_MONEY'],
};

export default function ProductDetailScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<DetailRouteProp>();
  const { productId } = route.params;

  const { products } = useSelector((s: RootState) => s.catalog);
  const { user } = useSelector((s: RootState) => s.auth);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  const product = products.find((p) => p.id === productId);
  const brand = product ? SERVICE_BRANDS[product.service] : null;
  const availableProviders = PROVIDERS_BY_COUNTRY[user?.country || 'CM'] || [];

  if (!product || !brand) return null;

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <LinearGradient colors={brand.gradient as any} style={styles.heroGradient}>
            <Text style={styles.heroEmoji}>{brand.emoji}</Text>
            <Text style={styles.heroService}>{brand.name}</Text>
            <Text style={styles.heroName}>{product.name}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Price card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={[styles.priceCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
            <View style={styles.priceRow}>
              <View>
                <Text style={[styles.priceLocal, { color: theme.text }]}>
                  {product.priceLocal?.toLocaleString()} {product.currency}
                </Text>
                <Text style={[styles.priceUSD, { color: theme.textSecondary }]}>
                  ≈ ${product.priceUSD}
                </Text>
              </View>
              <View style={[styles.durationBadge, { backgroundColor: Colors.primary + '20' }]}>
                <Text style={[styles.durationText, { color: Colors.primaryLight }]}>
                  {product.durationDays === 365 ? '1 an' : `${product.durationDays} jours`}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {product.description}
          </Text>
        </Animated.View>

        {/* Operators */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payer avec</Text>
          <View style={styles.operatorsRow}>
            {availableProviders.map((id) => {
              const op = OPERATOR_BRANDS[id as keyof typeof OPERATOR_BRANDS];
              return (
                <View key={id} style={[styles.operatorChip, { backgroundColor: op?.color + '20', borderColor: op?.color + '40' }]}>
                  <View style={[styles.operatorDot, { backgroundColor: op?.color }]} />
                  <Text style={[styles.operatorChipText, { color: op?.color }]}>{op?.name}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Inclus</Text>
          <View style={styles.featuresList}>
            {[
              '✅ Livraison instantanée du code',
              '✅ Code valable immédiatement',
              '✅ Support client 24/7',
              '✅ Paiement sécurisé',
              '⚡ Activation en moins de 30 secondes',
            ].map((f) => (
              <Text key={f} style={[styles.feature, { color: theme.textSecondary }]}>{f}</Text>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Buy button */}
      <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.bottomBar}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomPrice}>{product.priceLocal?.toLocaleString()} {product.currency}</Text>
            <Text style={styles.bottomLabel}>{product.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Payment', { productId })}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Acheter maintenant</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  header: { padding: 20, paddingTop: 56 },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: { marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', marginBottom: 16 },
  heroGradient: { padding: 28, alignItems: 'center', gap: 8 },
  heroEmoji: { fontSize: 56 },
  heroService: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  heroName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center' },

  priceCard: { marginHorizontal: 20, padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLocal: { fontSize: 28, fontWeight: '800' },
  priceUSD: { fontSize: 14 },
  durationBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  durationText: { fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 17, fontWeight: '800', marginHorizontal: 20, marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22, marginHorizontal: 20, marginBottom: 20 },

  operatorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginBottom: 20 },
  operatorChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  operatorDot: { width: 8, height: 8, borderRadius: 4 },
  operatorChipText: { fontSize: 13, fontWeight: '600' },

  featuresList: { marginHorizontal: 20, gap: 8 },
  feature: { fontSize: 14, lineHeight: 22 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: 'rgba(15,10,30,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  bottomContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomPrice: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  bottomLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  buyButton: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16 },
  buyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
