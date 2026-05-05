import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface AppBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const webBackground: ViewStyle = Platform.OS === 'web'
  ? ({ background: 'linear-gradient(180deg, #FFF8EF 0%, #FFECD8 56%, #FFF3E8 100%)' } as any)
  : {};

export default function AppBackground({ children, style }: AppBackgroundProps) {
  return (
    <View style={[styles.container, webBackground, style]}>
      <View style={[styles.ribbon, styles.ribbonTop]} />
      <View style={[styles.ribbon, styles.ribbonMiddle]} />
      <View style={[styles.ribbon, styles.ribbonBottom]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    overflow: 'hidden',
  },
  ribbon: {
    position: 'absolute',
    borderRadius: 32,
    opacity: 0.18,
    transform: [{ rotate: '-18deg' }],
  },
  ribbonTop: {
    width: 360,
    height: 86,
    top: 28,
    right: -120,
    backgroundColor: theme.primaryLight,
  },
  ribbonMiddle: {
    width: 300,
    height: 72,
    top: 250,
    left: -150,
    backgroundColor: theme.accent,
  },
  ribbonBottom: {
    width: 420,
    height: 92,
    bottom: 72,
    right: -180,
    backgroundColor: '#8E44AD',
    opacity: 0.1,
  },
});
