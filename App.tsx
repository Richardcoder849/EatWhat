import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { seedRecipes } from './src/services/recipeService';
import { seedData } from './src/data/seedRecipes';
import { theme } from './src/theme';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    seedRecipes(seedData)
      .catch(error => console.error('Failed to initialize recipes', error))
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => { mounted = false; };
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>吃</Text></View>
        <Text style={styles.brandName}>吃什么？</Text>
        <ActivityIndicator color={theme.primary} style={styles.spinner} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
  },
  brandMarkText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  brandName: { marginTop: 14, color: theme.text, fontSize: 22, fontWeight: '700' },
  spinner: { marginTop: 20 },
});
