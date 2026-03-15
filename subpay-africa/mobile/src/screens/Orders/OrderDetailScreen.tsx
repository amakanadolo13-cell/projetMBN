import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Clipboard, Linking, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store';
import { Colors, SERVICE_BRANDS } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type DetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRouteProp>();
  const { orderId } = route.params;

  const { orders } = useSelector((s: RootState) => s.orders);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  const order = orders.find((o) => o.id === orderId);
  const brand = order ? SERVICE_BRANDS[order.product.service as keyof typeof SERVICE_BRANDS] : null;

  const isCompleted = order?.status === 'COMPLETED';

  async function handleOpenApp() {
    if (!order?.product) return;
    const deepLink = Platform.OS === 'ios' ? order.product.deepLinkIOS : order.product.deepLinkAndroid;
    const webUrl = order.redeemUrl;

    if (deepLink) {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) { await Linking.openURL(deepLink); return; }
    }
    if (webUrl) await Linking.openURL(webUrl);
  }

  if (!order) return null;

  return (
    <LinearGradient
      colors={isDark ? [Colors.gradientStart, Colors.gradientMid] : ['#F8F7FF', '#EDE9FE']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Détail commande</Text>
        </View>

        {/* Product info */}
        <View style={[styles.card, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
          <View style={[styles.productIcon, { backgroundColor: brand?.color + '20' }]}>
            <Text style={{ fontSize: 40 }}>{brand?.emoji}</Text>
          </View>
          <Text style={[styles.productName, { color: theme.text }]}>{order.product.name}</Text>
          <Text style={[styles.orderNum, { color: theme.textSecondary }]}>{order.orderNumber}</Text>
          <Text style={[styles.amount, { color: theme.text }]}>
            {order.amountLocal.toLocaleString()} {order.currency}
          </Text>
        </View>

        {/* Activation code (si complété) */}
        {isCompleted && order.activationCode && (
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(order.activationCode!);
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.codeCard, { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }]}
            activeOpacity={0.8}
          >
            <View style={styles.codeHeader}>
              <Text style={{ color: Colors.success, fontSize: 14, fontWeight: '700' }}>Code d'activation</Text>
              <Ionicons name="copy-outline" size={18} color={Colors.success} />
            </View>
            <Text style={styles.codeValue} selectable>{order.activationCode}</Text>
            {order.pinCode && (
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
                PIN: {order.pinCode}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Open app button */}
        {isCompleted && (
          <TouchableOpacity onPress={handleOpenApp} activeOpacity={0.85}>
            <LinearGradient
              colors={[brand?.color || Colors.primary, brand?.gradient?.[0] || Colors.primaryDark]}
              style={styles.openButton}
            >
              <Text style={styles.openButtonText}>{brand?.emoji} Ouvrir {brand?.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Info rows */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
          {[
            { label: 'Statut', value: order.status },
            { label: 'Date', value: new Date(order.createdAt).toLocaleDateString('fr-FR') },
            { label: 'Pays', value: order.country },
            { label: 'Devise', value: order.currency },
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  card: { alignItems: 'center', padding: 24, borderRadius: 24, borderWidth: 1, gap: 8 },
  productIcon: { width: 80, height: 80, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  orderNum: { fontSize: 13 },
  amount: { fontSize: 28, fontWeight: '800' },
  codeCard: { padding: 18, borderRadius: 18, borderWidth: 1, gap: 8 },
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  codeValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  openButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  openButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  infoCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
});
