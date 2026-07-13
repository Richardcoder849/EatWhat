import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getDecisionHistory } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import { getRecipeCookTime, getPrimaryTag } from '../utils/recommendation';

function formatPickedAt(timestamp?: number) {
  if (!timestamp) return '还没决定过';
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return isToday
    ? `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default function DecisionHistoryScreen({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setRecipes(await getDecisionHistory());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadHistory(); }, [loadHistory]));

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} size="large" /></View>;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, recipes.length === 0 && styles.emptyContent]}
      data={recipes}
      keyExtractor={recipe => String(recipe.id)}
      ListHeaderComponent={recipes.length ? (
        <View style={styles.intro}>
          <Text style={styles.introTitle}>最近的决定</Text>
          <Text style={styles.introText}>优先展示最近确认吃过的菜，减少连续重复。</Text>
        </View>
      ) : null}
      ListEmptyComponent={(
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Ionicons name="time-outline" size={30} color={theme.primary} /></View>
          <Text style={styles.emptyTitle}>还没有决定记录</Text>
          <Text style={styles.emptyText}>在首页点“就吃这个”，这里会留下你的选择。</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
            <Text style={styles.primaryButtonText}>去决定今天吃什么</Text>
          </TouchableOpacity>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })} activeOpacity={0.8}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imageFallback]}><Ionicons name="restaurant-outline" size={24} color={theme.textMuted} /></View>
          )}
          <View style={styles.rowBody}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.meta}>{getRecipeCookTime(item)} 分钟 · {getPrimaryTag(item)}</Text>
            <Text style={styles.date}>{formatPickedAt(item.lastPickedAt)} · 选过 {item.pickCount || 1} 次</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  intro: { paddingBottom: 18 },
  introTitle: { color: theme.text, fontSize: 21, fontWeight: '800' },
  introText: { marginTop: 5, color: theme.textSecondary, fontSize: 13, lineHeight: 20 },
  row: { minHeight: 88, flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  image: { width: 70, height: 70, borderRadius: 8, backgroundColor: theme.surfaceMuted },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, minWidth: 0, marginHorizontal: 12 },
  name: { color: theme.text, fontSize: 16, fontWeight: '800' },
  meta: { marginTop: 5, color: theme.textSecondary, fontSize: 13 },
  date: { marginTop: 5, color: theme.textMuted, fontSize: 12 },
  separator: { height: 1, marginLeft: 82, backgroundColor: theme.border },
  emptyContent: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingHorizontal: 22 },
  emptyIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: theme.primaryBg },
  emptyTitle: { marginTop: 18, color: theme.text, fontSize: 20, fontWeight: '800' },
  emptyText: { marginTop: 8, textAlign: 'center', color: theme.textSecondary, fontSize: 14, lineHeight: 21 },
  primaryButton: { minHeight: 48, marginTop: 22, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: theme.primary },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
