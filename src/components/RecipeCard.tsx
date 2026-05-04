import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import GlassCard from './GlassCard';

interface RecipeCardProps {
  name: string;
  category: string;
  ingredientCount: number;
  stepCount: number;
  imageUri: string;
  onPress: () => void;
}

export default function RecipeCard({ name, category, ingredientCount, stepCount, imageUri, onPress }: RecipeCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ marginHorizontal: 16, marginVertical: 5 }}>
      <GlassCard style={{ padding: 0, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={24} color={theme.textMuted} />
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{category}</Text>
            </View>
          </View>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="basket-outline" size={13} color={theme.textSecondary} />
              <Text style={styles.metaText}> {ingredientCount}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={13} color={theme.textSecondary} />
              <Text style={styles.metaText}> {stepCount} 步</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} style={{ marginRight: 14 }} />
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 72, height: 72, borderRadius: 12, margin: 10,
  },
  imagePlaceholder: {
    width: 72, height: 72, borderRadius: 12, margin: 10,
    backgroundColor: theme.glassDark, justifyContent: 'center', alignItems: 'center',
  },
  content: { flex: 1, paddingVertical: 12, paddingRight: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '600', color: theme.text, flex: 1, marginRight: 8 },
  badge: { backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  meta: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
});
