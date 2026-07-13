import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../types';
import { theme } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AddEditRecipeScreen from '../screens/AddEditRecipeScreen';
import AIScreen from '../screens/AIScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CookingModeScreen from '../screens/CookingModeScreen';
import DecisionHistoryScreen from '../screens/DecisionHistoryScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const iconMap: Record<string, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: 'restaurant', default: 'restaurant-outline' },
  RecipeList: { focused: 'book', default: 'book-outline' },
  AI: { focused: 'bulb', default: 'bulb-outline' },
  Settings: { focused: 'settings', default: 'settings-outline' },
};

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
          backgroundColor: theme.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          elevation: 8,
          paddingBottom: 8,
          paddingTop: 7,
          height: 68,
          zIndex: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '决定' }} />
      <Tab.Screen name="RecipeList" component={RecipeListScreen} options={{ tabBarLabel: '菜谱' }} />
      <Tab.Screen name="AI" component={AIScreen} options={{ tabBarLabel: '灵感' }} />
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
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: '返回',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '菜谱详情' }} />
      <Stack.Screen name="DecisionHistory" component={DecisionHistoryScreen} options={{ title: '吃过什么' }} />
      <Stack.Screen name="CookingMode" component={CookingModeScreen} options={{ headerShown: false }} />
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
