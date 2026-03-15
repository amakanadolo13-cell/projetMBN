import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Typography, Spacing } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🌍',
    title: 'Netflix, Spotify & Plus',
    subtitle: 'Accédez à vos services favoris depuis l\'Afrique Centrale en quelques secondes.',
    gradient: ['#0F0A1E', '#1A0B3D'] as const,
    accent: Colors.netflix,
  },
  {
    id: '2',
    emoji: '📱',
    title: 'Payez avec Orange Money, MTN ou Airtel',
    subtitle: 'Utilisez votre Mobile Money local. Aucune carte bancaire internationale requise.',
    gradient: ['#0F0A1E', '#1A2B0D'] as const,
    accent: Colors.spotify,
  },
  {
    id: '3',
    emoji: '⚡',
    title: 'Activation Instantanée',
    subtitle: 'Dès que votre paiement est confirmé, votre abonnement s\'active immédiatement.',
    gradient: ['#0F0A1E', '#1A0B2D'] as const,
    accent: Colors.primary,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      navigation.navigate('Login');
    }
  }

  function handleSkip() {
    navigation.navigate('Login');
  }

  return (
    <LinearGradient
      colors={['#0F0A1E', '#1A0B3D']}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        onScroll={(e) => { scrollX.value = e.nativeEvent.contentOffset.x; }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i === currentIndex ? 24 : 8,
                backgroundColor: i === currentIndex ? Colors.primary : 'rgba(255,255,255,0.3)',
              },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Ignorer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.nextButton}
          >
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emojiContainer: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'width 0.3s',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  skipButton: {
    padding: 16,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
