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
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={styles.touch}>
      <GlassCard style={styles.card}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant-outline" size={24} color={theme.primary} />
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
              <Text style={styles.metaText}> {ingredientCount} 样食材</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={13} color={theme.textSecondary} />
              <Text style={styles.metaText}> {stepCount} 步</Text>
            </View>
          </View>
        </View>
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: { marginHorizontal: 16, marginVertical: 6 },
  card: { padding: 0, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  image: { width: 76, height: 76, borderRadius: 14, margin: 10 },
  imagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 14,
    margin: 10,
    backgroundColor: theme.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, paddingVertical: 12, paddingRight: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 17, fontWeight: '700', color: theme.text, flex: 1, marginRight: 8 },
  badge: { backgroundColor: theme.ink, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  meta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});
