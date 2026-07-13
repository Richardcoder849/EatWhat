import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface RecipeCardProps {
  name: string;
  category: string;
  cookTime: number;
  ingredientCount: number;
  imageUri?: string;
  onPress: () => void;
}

export default function RecipeCard({
  name,
  category,
  cookTime,
  ingredientCount,
  imageUri,
  onPress,
}: RecipeCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [imageUri]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      {imageUri && !imageFailed ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" onError={() => setImageFailed(true)} />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Ionicons name="restaurant-outline" size={30} color={theme.textMuted} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={theme.positive} />
            <Text style={styles.meta}>{cookTime}分钟</Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.meta}>{ingredientCount}种食材</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  image: { width: '100%', aspectRatio: 1.38, backgroundColor: theme.surfaceMuted },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  body: { minHeight: 104, padding: 10 },
  category: { color: theme.primary, fontSize: 11, lineHeight: 15, fontWeight: '800' },
  name: { minHeight: 42, marginTop: 3, color: theme.text, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meta: { color: theme.textSecondary, fontSize: 11, fontWeight: '600' },
  dot: { width: 3, height: 3, marginHorizontal: 6, borderRadius: 2, backgroundColor: theme.textMuted },
});
