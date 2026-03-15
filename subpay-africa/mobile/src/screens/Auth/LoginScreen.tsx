import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';

import { AppDispatch, RootState } from '../../store';
import { login, clearError } from '../../store/slices/authSlice';
import { Colors } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CountrySelector from '../../components/CountrySelector';

const COUNTRIES = [
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', prefix: '+237' },
  { code: 'CD', name: 'Congo RDC', flag: '🇨🇩', prefix: '+243' },
  { code: 'CG', name: 'Congo-Brazzaville', flag: '🇨🇬', prefix: '+242' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', prefix: '+241' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', prefix: '+226' },
];

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!phone || !password) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await dispatch(login({
      phone: selectedCountry.prefix + phone,
      password,
      country: selectedCountry.code,
    }));

    if (login.fulfilled.match(result)) {
      navigation.replace('MainTabs');
    }
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Bienvenue sur SubPay Africa 🌍</Text>
          </View>

          {/* Country selector */}
          <View style={styles.form}>
            <Text style={styles.label}>Pays</Text>
            <CountrySelector
              selected={selectedCountry}
              countries={COUNTRIES}
              onSelect={setSelectedCountry}
            />

            {/* Phone input */}
            <Text style={styles.label}>Numéro de téléphone</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.prefixBadge}>
                <Text style={styles.prefixText}>
                  {selectedCountry.flag} {selectedCountry.prefix}
                </Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={(t) => { setPhone(t); dispatch(clearError()); }}
                placeholder="6XX XXX XXX"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            {/* Password input */}
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(t) => { setPassword(t); dispatch(clearError()); }}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading || !phone || !password}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={[styles.loginButton, (!phone || !password) && styles.buttonDisabled]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register link */}
            <View style={styles.registerLink}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerTextBold}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 24 },
  header: { marginBottom: 40 },
  title: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  form: { flex: 1, gap: 12 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  phoneContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  prefixBadge: {
    backgroundColor: 'rgba(124,58,237,0.3)',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  prefixText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  phoneInput: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingVertical: 16, paddingHorizontal: 14 },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingVertical: 16, paddingHorizontal: 16 },
  eyeButton: { paddingHorizontal: 14 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },
  loginButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  loginButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  registerLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  registerTextBold: { color: Colors.primaryLight, fontSize: 14, fontWeight: '700' },
});
