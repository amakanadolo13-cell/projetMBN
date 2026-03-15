import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppDispatch } from '../store';
import { restoreSession } from '../store/slices/authSlice';
import { Colors } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const taglineOpacity = useSharedValue(0);
  const dotScale = useSharedValue(1);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  useEffect(() => {
    // Animation d'entrée
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));

    // Animation pulsante du dot
    dotScale.value = withSequence(
      withDelay(1000, withTiming(1.3, { duration: 500 })),
      withTiming(1, { duration: 500 })
    );

    // Vérifier la session et naviguer
    const timer = setTimeout(async () => {
      const result = await dispatch(restoreSession());
      if (restoreSession.fulfilled.match(result)) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Background glow effect */}
      <View style={styles.glowCircle} />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        {/* App icon / logo */}
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.iconDot, dotStyle]} />
          <Text style={styles.iconText}>SP</Text>
        </View>

        <Text style={styles.appName}>SubPay Africa</Text>

        <Animated.Text style={[styles.tagline, taglineStyle]}>
          🌍 Abonnements pour l'Afrique Centrale
        </Animated.Text>
      </Animated.View>

      <Animated.View style={[styles.footer, taglineStyle]}>
        <Text style={styles.footerText}>🔒 Paiement sécurisé via Mobile Money</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.1,
    top: height * 0.2,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.5)',
  },
  iconDot: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  iconText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
});
