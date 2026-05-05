import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
import { RootStackParamList, TabParamList } from '../types';
import { theme } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AddEditRecipeScreen from '../screens/AddEditRecipeScreen';
import AIScreen from '../screens/AIScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const iconMap: Record<string, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: 'flame', default: 'flame-outline' },
  RecipeList: { focused: 'book', default: 'book-outline' },
  AI: { focused: 'sparkles', default: 'sparkles-outline' },
  Settings: { focused: 'settings', default: 'settings-outline' },
};

function TabBackground() {
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1, backgroundColor: theme.tabBarBg }} />;
  }
  return <BlurView intensity={82} tint="light" style={{ flex: 1 }} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          const icons = iconMap[route.name] || iconMap.Home;
          const color = focused ? theme.primary : theme.textMuted;
          return <Ionicons name={focused ? icons.focused : icons.default} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarBackground: () => <TabBackground />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
      <Tab.Screen name="RecipeList" component={RecipeListScreen} options={{ tabBarLabel: '菜谱' }} />
      <Tab.Screen name="AI" component={AIScreen} options={{ tabBarLabel: 'AI点菜' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: '设置' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
        headerTransparent: Platform.OS !== 'web',
        headerBlurEffect: 'light',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '菜谱详情' }} />
      <Stack.Screen
        name="AddEditRecipe"
        component={AddEditRecipeScreen}
        options={({ route }: any) => ({
          title: route.params?.recipeId ? '编辑菜谱' : '添加菜谱',
        })}
      />
    </Stack.Navigator>
  );
}
