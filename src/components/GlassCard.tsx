import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { theme } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const blurStyle: ViewStyle = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' } as any)
  : {};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    ...blurStyle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
});
