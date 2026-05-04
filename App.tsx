import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { seedRecipes } from './src/services/recipeService';
import { seedData } from './src/data/seedRecipes';

export default function App() {
  useEffect(() => {
    seedRecipes(seedData);
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}
