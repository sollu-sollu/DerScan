import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../features/dashboard/HomeScreen';
import ScanScreen from '../features/scan/ScanScreen';
import PlanScreen from '../features/treatment/PlanScreen';
import TrackScreen from '../features/tracking/TrackScreen';
import CareScreen from '../features/care/CareScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import ResultsScreen from '../features/results/ResultsScreen';
import CameraScreen from '../features/scan/CameraScreen';
import LoginScreen from '../features/auth/LoginScreen';
import SignUpScreen from '../features/auth/SignUpScreen';

import { useTheme } from '../theme';
import type { AnalysisResult } from '../services/api';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  Camera: { selectedImage?: string };
  Results: { analysisData?: AnalysisResult; scanId?: string; imageUri?: string };
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Plan: undefined;
  Track: undefined;
  Care: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="camera-iris" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Track"
        component={TrackScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Care"
        component={CareScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="medical-bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDarkMode } = useTheme();
  const { isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
    });
    return subscriber; // unsubscribe on unmount
  }, [setUser]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {isAuthenticated ? (
          // Main App Flow
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ animation: 'fade' }}
            />
          </>
        ) : (
          // Authentication Flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
