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
    backgroundColor: theme.glass,
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    ...blurStyle,
    shadowColor: '#572D0C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
});
