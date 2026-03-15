import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🌍',
    title: 'Netflix, Spotify & Plus',
    subtitle: 'Accédez à vos services favoris depuis l\'Afrique Centrale en quelques secondes.',
    accent: Colors.netflix,
  },
  {
    id: '2',
    emoji: '📱',
    title: 'Payez avec Orange Money, MTN ou Airtel',
    subtitle: 'Utilisez votre Mobile Money local. Aucune carte bancaire internationale requise.',
    accent: Colors.spotify,
  },
  {
    id: '3',
    emoji: '⚡',
    title: 'Activation Instantanée',
    subtitle: 'Dès que votre paiement est confirmé, votre abonnement s\'active immédiatement.',
    accent: '#FFFFFF',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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
      colors={['#000000', '#111111']}
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
                backgroundColor: i === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
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

        <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    color: 'rgba(255,255,255,0.55)',
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
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  nextText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
