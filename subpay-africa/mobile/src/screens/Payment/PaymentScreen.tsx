import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store';
import { createOrder } from '../../store/slices/ordersSlice';
import { Colors, OPERATOR_BRANDS, SERVICE_BRANDS } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COUNTRIES } from '../../config/countries';

type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;

// Opérateurs disponibles par pays
const PROVIDERS_BY_COUNTRY: Record<string, string[]> = {
  CM: ['ORANGE_MONEY', 'MTN_MOMO'],
  CD: ['ORANGE_MONEY', 'AIRTEL_MONEY'],
  CG: ['AIRTEL_MONEY', 'MTN_MOMO'],
  GA: ['AIRTEL_MONEY', 'MOOV_MONEY'],
  BF: ['ORANGE_MONEY', 'MOOV_MONEY', 'CORIS_MONEY'],
};

export default function PaymentScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<PaymentRouteProp>();
  const { productId } = route.params;

  const { user } = useSelector((s: RootState) => s.auth);
  const { products } = useSelector((s: RootState) => s.catalog);
  const { isCreating, error } = useSelector((s: RootState) => s.orders);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  const product = products.find((p) => p.id === productId);
  const brand = product ? SERVICE_BRANDS[product.service] : null;

  const availableProviders = PROVIDERS_BY_COUNTRY[user?.country || 'CM'] || [];
  const [selectedProvider, setSelectedProvider] = useState(availableProviders[0] || '');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  if (!product) return null;

  const operatorBrand = OPERATOR_BRANDS[selectedProvider as keyof typeof OPERATOR_BRANDS];
  const countryConfig = COUNTRIES[user?.country as keyof typeof COUNTRIES];

  async function handleConfirmPayment() {
    if (!paymentPhone || !agreeTerms) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await dispatch(createOrder({
      productId,
      paymentProvider: selectedProvider,
      paymentPhone: countryConfig?.phonePrefix + paymentPhone,
    }));

    if (createOrder.fulfilled.match(result)) {
      const { order } = result.payload;
      navigation.replace('PaymentProcessing', {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }
  }

  return (
    <LinearGradient
      colors={isDark ? [Colors.gradientStart, Colors.gradientMid] : ['#F8F7FF', '#EDE9FE']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Paiement</Text>
        </View>

        {/* Order Summary Card */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={[styles.summaryCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
            <View style={[styles.summaryIcon, { backgroundColor: brand?.color + '20' }]}>
              <Text style={{ fontSize: 36 }}>{brand?.emoji}</Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={[styles.summaryService, { color: brand?.color }]}>{brand?.name}</Text>
              <Text style={[styles.summaryName, { color: theme.text }]}>{product.name}</Text>
              <Text style={[styles.summaryDuration, { color: theme.textSecondary }]}>
                {product.durationDays === 365 ? 'Valable 1 an' : `Valable ${product.durationDays} jours`}
              </Text>
            </View>
            <View style={styles.summaryPricing}>
              <Text style={[styles.summaryPrice, { color: theme.text }]}>
                {product.priceLocal?.toLocaleString()}
              </Text>
              <Text style={[styles.summaryCurrency, { color: theme.textSecondary }]}>
                {product.currency}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Choose Operator */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>
            Choisir votre opérateur
          </Text>
          <View style={styles.operatorsGrid}>
            {availableProviders.map((providerId) => {
              const op = OPERATOR_BRANDS[providerId as keyof typeof OPERATOR_BRANDS];
              const isSelected = selectedProvider === providerId;
              return (
                <TouchableOpacity
                  key={providerId}
                  onPress={() => {
                    setSelectedProvider(providerId);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.operatorCard,
                    {
                      borderColor: isSelected ? op?.color : isDark ? Colors.dark.cardBorder : Colors.light.cardBorder,
                      backgroundColor: isSelected
                        ? (op?.color + '15')
                        : (isDark ? Colors.dark.card : Colors.light.card),
                    },
                  ]}
                >
                  <View style={[styles.operatorColorDot, { backgroundColor: op?.color }]} />
                  <Text style={[styles.operatorName, { color: theme.text }]}>{op?.name}</Text>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: op?.color }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Phone input */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>
            Numéro {operatorBrand?.name}
          </Text>
          <View style={[
            styles.phoneContainer,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }
          ]}>
            <View style={[styles.prefixContainer, { backgroundColor: operatorBrand?.color + '20' }]}>
              <Text style={[styles.prefixText, { color: operatorBrand?.color }]}>
                {countryConfig?.flag} {countryConfig?.phonePrefix}
              </Text>
            </View>
            <TextInput
              style={[styles.phoneInput, { color: theme.text }]}
              value={paymentPhone}
              onChangeText={setPaymentPhone}
              placeholder={`Numéro ${operatorBrand?.name}`}
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={[styles.phoneHint, { color: theme.textSecondary }]}>
            💡 Un code USSD sera envoyé sur ce numéro pour confirmer le paiement
          </Text>
        </Animated.View>

        {/* Terms checkbox */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.8}
          >
            <View style={[
              styles.checkbox,
              { borderColor: agreeTerms ? Colors.primary : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' },
              agreeTerms && { backgroundColor: Colors.primary },
            ]}>
              {agreeTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={[styles.termsText, { color: theme.textSecondary }]}>
              J'accepte les conditions d'utilisation. Paiement non remboursable.
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Pay button */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={{ marginTop: 'auto', paddingTop: 24 }}>
          <TouchableOpacity
            onPress={handleConfirmPayment}
            disabled={isCreating || !paymentPhone || !agreeTerms}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[operatorBrand?.gradient[0] || Colors.primary, operatorBrand?.gradient[1] || Colors.primaryDark]}
              style={[
                styles.payButton,
                (!paymentPhone || !agreeTerms) && styles.payButtonDisabled,
              ]}
            >
              {isCreating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.payButtonContent}>
                  <Text style={styles.payButtonText}>
                    Payer {product.priceLocal?.toLocaleString()} {product.currency}
                  </Text>
                  <Text style={styles.payButtonSubtext}>via {operatorBrand?.name}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.securityNote, { color: theme.textMuted }]}>
            🔒 Paiement 100% sécurisé • Activation garantie
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800' },

  summaryCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
    gap: 12,
    alignItems: 'center',
  },
  summaryIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  summaryInfo: { flex: 1 },
  summaryService: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 },
  summaryName: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  summaryDuration: { fontSize: 12 },
  summaryPricing: { alignItems: 'flex-end' },
  summaryPrice: { fontSize: 22, fontWeight: '800' },
  summaryCurrency: { fontSize: 12 },

  sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  operatorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
    minWidth: '47%',
    flex: 1,
  },
  operatorColorDot: { width: 10, height: 10, borderRadius: 5 },
  operatorName: { fontSize: 13, fontWeight: '600', flex: 1 },
  checkmark: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  phoneContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  prefixContainer: { paddingHorizontal: 14, justifyContent: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' },
  prefixText: { fontSize: 13, fontWeight: '700' },
  phoneInput: { flex: 1, paddingVertical: 16, paddingHorizontal: 14, fontSize: 16 },
  phoneHint: { fontSize: 12, lineHeight: 18, marginBottom: 20 },

  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  termsText: { flex: 1, fontSize: 13, lineHeight: 18 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },

  payButton: { paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginBottom: 12 },
  payButtonDisabled: { opacity: 0.5 },
  payButtonContent: { alignItems: 'center', gap: 2 },
  payButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  payButtonSubtext: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  securityNote: { textAlign: 'center', fontSize: 12 },
});

