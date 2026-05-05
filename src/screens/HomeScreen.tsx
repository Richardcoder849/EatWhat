import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRandomRecipe, getRecipeCount } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';
import AppBackground from '../components/AppBackground';

const greetings = ['今天想吃什么？', '开饭灵感已就绪', '翻一张今晚菜单', '让厨房热闹起来'];

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
        <View style={styles.brandArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="flame" size={28} color="#fff" />
          </View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>你的菜单里有 {count} 道好菜</Text>
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
              <Text style={styles.resultLabel}>今晚推荐</Text>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <View style={styles.resultFooter}>
                <View style={styles.resultBadge}><Text style={styles.resultBadgeText}>{recipe.category}</Text></View>
                <Text style={styles.viewHint}>查看做法</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.primary} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="book-outline" size={44} color={theme.textMuted} />
            <Text style={styles.emptyText}>还没有菜谱</Text>
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
  content: { flex: 1, alignItems: 'center', paddingTop: 74, paddingHorizontal: 24 },
  brandArea: { alignItems: 'center', marginBottom: 26 },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 14,
    elevation: 8,
  },
  greeting: { fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
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
  resultCard: { padding: 24, marginTop: 24 },
  resultLabel: { fontSize: 13, color: theme.primaryDark, marginBottom: 8, fontWeight: '800' },
  recipeName: { fontSize: 30, fontWeight: '900', color: theme.text, marginBottom: 18 },
  resultFooter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultBadge: { backgroundColor: theme.ink, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  resultBadgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  viewHint: { fontSize: 14, color: theme.primary, fontWeight: '800' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: theme.textMuted, marginTop: 12, marginBottom: 20 },
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
