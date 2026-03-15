import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
  withSpring, runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../../store';
import { fetchOrderById } from '../../store/slices/ordersSlice';
import { Colors } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ProcessingRouteProp = RouteProp<RootStackParamList, 'PaymentProcessing'>;

const { width } = Dimensions.get('window');

const STEPS = [
  { icon: '📲', label: 'USSD envoyé sur votre téléphone', done: false },
  { icon: '✅', label: 'Confirmation du paiement', done: false },
  { icon: '⚡', label: 'Activation de l\'abonnement', done: false },
  { icon: '🎉', label: 'Code livré instantanément', done: false },
];

export default function PaymentProcessingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProcessingRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { orderId, orderNumber } = route.params;

  const { currentOrder } = useSelector((s: RootState) => s.orders);

  const pulseScale = useSharedValue(1);
  const spinnerRotate = useSharedValue(0);
  const ringOpacity = useSharedValue(1);
  const ringScale = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  useEffect(() => {
    // Animations
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1
    );

    ringOpacity.value = withRepeat(
      withSequence(withTiming(0.1, { duration: 1500 }), withTiming(0.4, { duration: 1500 })),
      -1
    );
    ringScale.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 1500 }), withTiming(1, { duration: 0 })),
      -1
    );

    // Polling toutes les 3 secondes pour l'état de la commande
    const interval = setInterval(async () => {
      const result = await dispatch(fetchOrderById(orderId));
      if (fetchOrderById.fulfilled.match(result)) {
        const order = result.payload;
        if (order.status === 'COMPLETED') {
          clearInterval(interval);
          navigation.replace('OrderSuccess', { orderId });
        } else if (order.status === 'FAILED') {
          clearInterval(interval);
          navigation.goBack();
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  const status = currentOrder?.status;
  const stepsDone = {
    step0: ['PAYMENT_INITIATED', 'PAYMENT_CONFIRMED', 'PROCESSING', 'COMPLETED'].includes(status || ''),
    step1: ['PAYMENT_CONFIRMED', 'PROCESSING', 'COMPLETED'].includes(status || ''),
    step2: ['PROCESSING', 'COMPLETED'].includes(status || ''),
    step3: status === 'COMPLETED',
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated icon */}
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Animated.View style={[styles.iconCircle, pulseStyle]}>
            <Text style={styles.iconEmoji}>⏳</Text>
          </Animated.View>
        </View>

        <Text style={styles.title}>Paiement en cours</Text>
        <Text style={styles.orderNumber}>Commande {orderNumber}</Text>
        <Text style={styles.subtitle}>
          Vérifiez votre téléphone et entrez votre PIN Mobile Money
        </Text>

        {/* Progress steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, i) => {
            const isDone = Object.values(stepsDone)[i];
            return (
              <Animated.View
                key={i}
                style={[styles.step, isDone && styles.stepDone]}
              >
                <View style={[styles.stepIcon, isDone && { backgroundColor: Colors.success + '30' }]}>
                  <Text style={styles.stepEmoji}>{isDone ? '✅' : step.icon}</Text>
                </View>
                <Text style={[styles.stepLabel, isDone && { color: Colors.success }]}>
                  {step.label}
                </Text>
                {isDone && (
                  <View style={styles.stepCheck}>
                    <Text style={{ color: Colors.success, fontSize: 14 }}>✓</Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        <Text style={styles.footer}>
          🔒 Votre code sera livré dans les 30 secondes suivant la confirmation
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124,58,237,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  orderNumber: { fontSize: 13, color: Colors.primaryLight, marginBottom: 12, fontWeight: '600' },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  stepsContainer: { width: '100%', gap: 12, marginBottom: 40 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stepDone: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.2)',
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepEmoji: { fontSize: 18 },
  stepLabel: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  stepCheck: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  footer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
