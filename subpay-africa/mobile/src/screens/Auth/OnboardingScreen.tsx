import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  FadeIn, FadeOut, SlideInRight, SlideOutLeft,
} from 'react-native-reanimated';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🌍',
    tag: 'AFRIQUE CENTRALE',
    title: 'Netflix, Spotify\n& Plus',
    subtitle: 'Accédez à vos services numériques favoris depuis le Cameroun, Congo, Gabon et plus.',
    accent: '#E50914',
  },
  {
    id: '2',
    emoji: '📱',
    tag: 'PAIEMENT LOCAL',
    title: 'Orange Money,\nMTN ou Airtel',
    subtitle: 'Payez avec votre Mobile Money local. Aucune carte bancaire internationale requise.',
    accent: '#1DB954',
  },
  {
    id: '3',
    emoji: '⚡',
    tag: 'INSTANTANÉ',
    title: 'Activation\nen 30 secondes',
    subtitle: 'Dès que votre paiement est confirmé, votre code d\'activation est livré instantanément.',
    accent: '#FFFFFF',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);

  const slide = SLIDES[currentIndex];

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setKey((k) => k + 1);
    } else {
      navigation.navigate('Login');
    }
  }

  function handleSkip() {
    navigation.navigate('Login');
  }

  return (
    <View style={styles.container}>
      {/* Background accent blur */}
      <View style={[styles.accentBlob, { backgroundColor: slide.accent + '18' }]} />

      {/* Content */}
      <Animated.View key={key} entering={FadeIn.duration(400)} style={styles.slideContent}>
        {/* Tag */}
        <View style={[styles.tagContainer, { borderColor: slide.accent + '40', backgroundColor: slide.accent + '12' }]}>
          <Text style={[styles.tagText, { color: slide.accent }]}>{slide.tag}</Text>
        </View>

        {/* Emoji hero */}
        <View style={styles.emojiWrapper}>
          <View style={[styles.emojiRing, { borderColor: slide.accent + '30' }]}>
            <View style={[styles.emojiInner, { backgroundColor: slide.accent + '12' }]}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === currentIndex ? 28 : 8,
                  backgroundColor: i === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Ignorer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} activeOpacity={0.9} style={styles.nextButton}>
            <LinearGradient
              colors={['#FFFFFF', '#E8E8E8']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextText}>
                {currentIndex === SLIDES.length - 1 ? 'Commencer →' : 'Suivant →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Déjà un compte ? <Text style={styles.loginLinkBold}>Se connecter</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 28,
  },
  accentBlob: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    right: -100,
  },

  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tagContainer: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 36,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  emojiWrapper: {
    marginBottom: 40,
  },
  emojiRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 52 },

  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 18,
    lineHeight: 50,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 26,
    maxWidth: width * 0.8,
  },

  bottomSection: { gap: 24 },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: { height: 8, borderRadius: 4 },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: { paddingVertical: 14, paddingHorizontal: 4 },
  skipText: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '500' },
  nextButton: { borderRadius: 18, overflow: 'hidden' },
  nextButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  nextText: { color: '#000000', fontSize: 16, fontWeight: '800' },

  loginLink: { alignItems: 'center' },
  loginLinkText: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },
  loginLinkBold: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
});
