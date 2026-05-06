import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRandomRecipe, getRecipeCount } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';
import AppBackground from '../components/AppBackground';

const { width } = Dimensions.get('window');

const greetings = ['今天想吃什么？', '开饭灵感已就绪', '翻一张今晚菜单', '让厨房热闹起来'];
const KITCHEN_ICONS = ['flame', 'bonfire', 'thermometer', 'restaurant', 'pizza', 'wine'];

export default function HomeScreen({ navigation }: any) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);

  useFocusEffect(useCallback(() => { loadCount(); pickRandom(); }, []));

  async function loadCount() {
    try { setCount(await getRecipeCount()); } catch {}
  }

  async function pickRandom() {
    setLoading(true);
    try { setRecipe(await getRandomRecipe()); } catch { setRecipe(null); }
    setLoading(false);
  }

  return (
    <AppBackground>
      <View style={styles.content}>

        {/* Kitchen decorative header */}
        <View style={styles.kitchenHeader}>
          <View style={styles.kitchenIllustration}>
            <View style={styles.panIcon}>
              <Ionicons name="flame" size={32} color={theme.primary} />
            </View>
            <View style={styles.steam1} />
            <View style={styles.steam2} />
            <View style={styles.steam3} />
          </View>

          <View style={styles.brandArea}>
            <Text style={styles.greeting}>{greeting}</Text>
            <View style={styles.kitchenBadge}>
              <Ionicons name="restaurant-outline" size={13} color={theme.primary} />
              <Text style={styles.subtitle}>你的厨房有 {count} 道好菜</Text>
            </View>
          </View>

          {/* Kitchen tools decoration */}
          <View style={styles.toolsRow}>
            {KITCHEN_ICONS.slice(0, 5).map((icon, i) => (
              <View key={i} style={styles.toolIcon}>
                <Ionicons name={icon as any} size={14} color={theme.textMuted} />
              </View>
            ))}
          </View>
        </View>

        {/* Food image decoration */}
        <View style={styles.foodStrip}>
          <View style={[styles.foodItem, { backgroundColor: '#FF6B3520' }]}>
            <Text style={styles.foodEmoji}>🥩</Text>
          </View>
          <View style={[styles.foodItem, { backgroundColor: '#16A08520' }]}>
            <Text style={styles.foodEmoji}>🥗</Text>
          </View>
          <View style={[styles.foodItem, { backgroundColor: '#FFB25C20' }]}>
            <Text style={styles.foodEmoji}>🍝</Text>
          </View>
          <View style={[styles.foodItem, { backgroundColor: '#D9481E20' }]}>
            <Text style={styles.foodEmoji}>🍲</Text>
          </View>
          <View style={[styles.foodItem, { backgroundColor: '#FF6B3520' }]}>
            <Text style={styles.foodEmoji}>🥘</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shakeBtn} onPress={pickRandom} activeOpacity={0.86}>
          <Ionicons name="shuffle" size={20} color="#fff" style={styles.btnIcon} />
          <Text style={styles.shakeBtnText}>随机来一口</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        ) : recipe ? (
          <TouchableOpacity onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })} activeOpacity={0.8} style={styles.resultTouch}>
            <GlassCard style={styles.resultCard}>
              {recipe.imageUri ? (
                <Image source={{ uri: recipe.imageUri }} style={styles.recipeThumb} />
              ) : null}
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel}>🍽️ 今晚推荐</Text>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <View style={styles.resultFooter}>
                  <View style={styles.resultBadge}><Text style={styles.resultBadgeText}>{recipe.category}</Text></View>
                  <Text style={styles.viewHint}>查看做法</Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="book-outline" size={44} color={theme.textMuted} />
            </View>
            <Text style={styles.emptyText}>还没有菜谱</Text>
            <Text style={styles.emptyHint}>添加你的第一道菜，开启厨房之旅</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditRecipe')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>添加第一道菜</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', paddingTop: 58, paddingHorizontal: 20 },
  // Kitchen decorative header
  kitchenHeader: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  kitchenIllustration: {
    width: 80,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  panIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  steam1: {
    position: 'absolute',
    top: -4,
    left: 18,
    width: 6,
    height: 14,
    borderRadius: 3,
    backgroundColor: 'rgba(255,107,53,0.2)',
  },
  steam2: {
    position: 'absolute',
    top: -8,
    left: 34,
    width: 6,
    height: 18,
    borderRadius: 3,
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
  steam3: {
    position: 'absolute',
    top: -2,
    right: 16,
    width: 6,
    height: 12,
    borderRadius: 3,
    backgroundColor: 'rgba(255,107,53,0.18)',
  },
  brandArea: { alignItems: 'center', marginBottom: 10 },
  greeting: { fontSize: 26, fontWeight: '900', color: theme.text, marginBottom: 6, textAlign: 'center' },
  kitchenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subtitle: { fontSize: 13, color: theme.primary, fontWeight: '700' },
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  toolIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  // Food strip
  foodStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  foodItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodEmoji: { fontSize: 22 },
  // Shake button
  shakeBtn: {
    flexDirection: 'row',
    paddingHorizontal: 34,
    paddingVertical: 15,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  btnIcon: { marginRight: 7 },
  shakeBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  loader: { marginTop: 44 },
  resultTouch: { width: '100%' },
  resultCard: { padding: 0, marginTop: 20, overflow: 'hidden' },
  recipeThumb: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  resultContent: { padding: 20 },
  resultLabel: { fontSize: 13, color: theme.primaryDark, marginBottom: 6, fontWeight: '800' },
  recipeName: { fontSize: 28, fontWeight: '900', color: theme.text, marginBottom: 14 },
  resultFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultBadge: { backgroundColor: theme.ink, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  resultBadgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  viewHint: { fontSize: 14, color: theme.primary, fontWeight: '800' },
  // Empty state
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  emptyText: { fontSize: 18, color: theme.text, fontWeight: '700', marginBottom: 4 },
  emptyHint: { fontSize: 14, color: theme.textMuted, marginBottom: 20 },
  addBtn: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
