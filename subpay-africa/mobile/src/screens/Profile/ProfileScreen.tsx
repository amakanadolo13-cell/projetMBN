import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { Colors } from '../../theme';

const COUNTRY_NAMES: Record<string, string> = {
  CM: '🇨🇲 Cameroun',
  CD: '🇨🇩 Congo RDC',
  CG: '🇨🇬 Congo-Brazzaville',
  GA: '🇬🇦 Gabon',
  BF: '🇧🇫 Burkina Faso',
};

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { orders } = useSelector((s: RootState) => s.orders);
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

  function handleToggleTheme() {
    dispatch(toggleTheme());
  }

  async function handleLogout() {
    dispatch(logout());
  }

  const menuItems = [
    {
      section: 'Compte',
      items: [
        { icon: 'person-outline', label: 'Informations personnelles', action: () => {} },
        { icon: 'location-outline', label: COUNTRY_NAMES[user?.country || 'CM'], action: () => {} },
        { icon: 'notifications-outline', label: 'Notifications', action: () => {} },
      ],
    },
    {
      section: 'Apparence',
      items: [
        {
          icon: isDark ? 'moon' : 'sunny-outline',
          label: 'Mode sombre',
          action: handleToggleTheme,
          toggle: true,
          toggleValue: isDark,
        },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Centre d\'aide', action: () => {} },
        { icon: 'chatbubble-outline', label: 'Contacter le support', action: () => {} },
        { icon: 'document-text-outline', label: 'Conditions d\'utilisation', action: () => {} },
      ],
    },
  ];

  return (
    <LinearGradient
      colors={isDark ? [Colors.gradientStart, Colors.gradientMid] : ['#F8F7FF', '#EDE9FE']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.profileHeader}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.firstName?.[0] || user?.phone?.[0] || 'U').toUpperCase()}
            </Text>
          </LinearGradient>

          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Utilisateur'}
          </Text>
          <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user?.phone}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
              <Text style={[styles.statValue, { color: theme.text }]}>{orders.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Commandes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
              <Text style={[styles.statValue, { color: Colors.success }]}>{completedOrders}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Activés</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>4</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Services</Text>
            </View>
          </View>
        </Animated.View>

        {/* Menu sections */}
        {menuItems.map((section, si) => (
          <Animated.View key={section.section} entering={FadeInDown.delay(si * 100 + 200).duration(500)}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{section.section}</Text>
            <View style={[styles.menuCard, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card, borderColor: isDark ? Colors.dark.cardBorder : Colors.light.cardBorder }]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.action}
                  style={[
                    styles.menuItem,
                    i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                  ]}
                  activeOpacity={item.toggle ? 1 : 0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: Colors.primary + '15' }]}>
                    <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                  {item.toggle ? (
                    <Switch
                      value={item.toggleValue}
                      onValueChange={item.action}
                      trackColor={{ false: '#374151', true: Colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.version, { color: theme.textMuted }]}>SubPay Africa v1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 100, gap: 16 },

  profileHeader: { alignItems: 'center', marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userPhone: { fontSize: 14, marginBottom: 20 },

  statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  statCard: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '500' },

  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  menuCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12 },
});
