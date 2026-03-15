import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { RootState } from '../store';
import { Colors } from '../theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import CatalogScreen from '../screens/Catalog/CatalogScreen';
import ProductDetailScreen from '../screens/Catalog/ProductDetailScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import PaymentProcessingScreen from '../screens/Payment/PaymentProcessingScreen';
import OrderSuccessScreen from '../screens/Payment/OrderSuccessScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import OrderDetailScreen from '../screens/Orders/OrderDetailScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Payment: { productId: string };
  PaymentProcessing: { orderId: string; orderNumber: string };
  OrderSuccess: { orderId: string };
  OrderDetail: { orderId: string };
};

export type TabParamList = {
  Home: undefined;
  Catalog: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabBarBackground() {
  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={StyleSheet.absoluteFill}
    />
  );
}

function MainTabs() {
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: isDark ? 'rgba(15,10,30,0.85)' : 'rgba(255,255,255,0.85)',
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
        },
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Catalog') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ tabBarLabel: 'Services' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'Commandes' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isDark = useSelector((s: RootState) => s.theme.mode === 'dark');
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: Colors.dark.background, card: Colors.dark.surface },
      }
    : {
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: Colors.light.background, card: Colors.light.surface },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="PaymentProcessing"
              component={PaymentProcessingScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen
              name="OrderSuccess"
              component={OrderSuccessScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
