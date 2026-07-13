import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#122D1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
