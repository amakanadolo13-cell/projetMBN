import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Clipboard, Linking, Share, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay, withSequence,
  FadeInDown, ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store';
import { Colors, SERVICE_BRANDS } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type SuccessRouteProp = RouteProp<RootStackParamList, 'OrderSuccess'>;

export default function OrderSuccessScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<SuccessRouteProp>();
  const { orderId } = route.params;

  const { orders } = useSelector((s: RootState) => s.orders);
  const order = orders.find((o) => o.id === orderId);

  const brand = order ? SERVICE_BRANDS[order.product.service as keyof typeof SERVICE_BRANDS] : null;

  const [codeCopied, setCodeCopied] = useState(false);

  const checkScale = useSharedValue(0);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 200 }));
  }, []);

  async function handleCopyCode() {
    if (!order?.activationCode) return;
    await Clipboard.setStringAsync(order.activationCode);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  async function handleOpenApp() {
    if (!order?.product) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const deepLink = Platform.OS === 'ios'
      ? order.product.deepLinkIOS
      : order.product.deepLinkAndroid;

    const webUrl = order.redeemUrl;

    if (deepLink) {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
        return;
      }
    }

    if (webUrl) {
      await Linking.openURL(webUrl);
    }
  }

  if (!order) return null;

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Success animation */}
        <Animated.View style={[styles.successCircle, checkStyle]}>
          <LinearGradient
            colors={[Colors.success, '#059669']}
            style={styles.successGradient}
          >
            <Ionicons name="checkmark" size={52} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={styles.successTitle}>Abonnement activé ! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Votre {brand?.name} est prêt. Utilisez le code ci-dessous.
          </Text>
        </Animated.View>

        {/* Activation code card */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.codeCard}>
          <View style={styles.codeCardHeader}>
            <Text style={[styles.codeService, { color: brand?.color }]}>{brand?.emoji} {brand?.name}</Text>
            <Text style={styles.codeLabel}>Code d'activation</Text>
          </View>

          <TouchableOpacity onPress={handleCopyCode} style={styles.codeContainer} activeOpacity={0.8}>
            <Text style={styles.codeText} selectable>{order.activationCode}</Text>
            <View style={[styles.copyButton, codeCopied && { backgroundColor: Colors.success }]}>
              <Ionicons
                name={codeCopied ? 'checkmark' : 'copy-outline'}
                size={18}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {order.pinCode && (
            <View style={styles.pinRow}>
              <Text style={styles.pinLabel}>PIN: </Text>
              <Text style={styles.pinValue}>{order.pinCode}</Text>
            </View>
          )}

          {codeCopied && (
            <Animated.Text entering={FadeInDown.duration(300)} style={styles.copiedText}>
              ✅ Code copié !
            </Animated.Text>
          )}
        </Animated.View>

        {/* Instructions */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Comment activer ?</Text>
          <View style={styles.instructionStep}>
            <Text style={styles.instructionNum}>1</Text>
            <Text style={styles.instructionText}>
              Copiez le code ci-dessus
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.instructionNum}>2</Text>
            <Text style={styles.instructionText}>
              Appuyez sur "Ouvrir {brand?.name}" ci-dessous
            </Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.instructionNum}>3</Text>
            <Text style={styles.instructionText}>
              Collez le code dans la section "Utiliser un code cadeau"
            </Text>
          </View>
        </Animated.View>

        {/* Buttons */}
        <Animated.View entering={FadeInDown.delay(900).duration(600)} style={styles.buttons}>
          <TouchableOpacity onPress={handleOpenApp} activeOpacity={0.85} style={{ flex: 1 }}>
            <LinearGradient
              colors={[brand?.color || Colors.primary, (brand?.gradient?.[0]) || Colors.primaryDark]}
              style={styles.openAppButton}
            >
              <Text style={styles.openAppText}>{brand?.emoji} Ouvrir {brand?.name}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Orders' as any)}
            style={styles.ordersButton}
            activeOpacity={0.85}
          >
            <Ionicons name="receipt-outline" size={18} color={Colors.primaryLight} />
            <Text style={styles.ordersButtonText}>Mes commandes</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  successCircle: { marginBottom: 28 },
  successGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  codeCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 20,
  },
  codeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  codeService: { fontSize: 14, fontWeight: '700' },
  codeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },
  codeText: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  pinLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  pinValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  copiedText: { textAlign: 'center', color: Colors.success, fontSize: 13, marginTop: 8, fontWeight: '600' },

  instructions: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  instructionsTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  instructionStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  instructionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionText: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 },

  buttons: { width: '100%', gap: 12 },
  openAppButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  openAppText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
    backgroundColor: 'rgba(167,139,250,0.1)',
  },
  ordersButtonText: { color: Colors.primaryLight, fontSize: 15, fontWeight: '600' },
});
