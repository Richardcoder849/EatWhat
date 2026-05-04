import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRandomRecipe, getRecipeCount } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';

const bgGrad = Platform.OS === 'web'
  ? { background: 'linear-gradient(180deg, #F2F5EE 0%, #EAF0E4 50%, #E5EDDC 100%)' }
  : { backgroundColor: theme.background };

const greetings = ['今天想吃什么呢？', '饿了没？', '来点好吃的吧！', '翻个牌子吧！'];

export default function HomeScreen({ navigation }: any) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);

  useFocusEffect(useCallback(() => { loadCount(); pickRandom(); }, []));

  async function loadCount() { try { setCount(await getRecipeCount()); } catch {} }
  async function pickRandom() {
    setLoading(true);
    try { setRecipe(await getRandomRecipe()); } catch { setRecipe(null); }
    setLoading(false);
  }

  return (
    <View style={[styles.container, bgGrad]}>
      {/* Decorative blobs */}
      <View style={[styles.blob, { width: 260, height: 260, top: -80, right: -80, backgroundColor: '#A8D86B' }]} />
      <View style={[styles.blob, { width: 200, height: 200, bottom: 120, left: -60, backgroundColor: '#86C84B' }]} />
      <View style={[styles.blob, { width: 140, height: 140, top: '45%', right: -30, backgroundColor: '#C5E8A0' }]} />

      <View style={styles.content}>
        <View style={styles.brandArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={28} color="#fff" />
          </View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>你的菜谱里有 {count} 道菜</Text>
        </View>

        <TouchableOpacity style={styles.shakeBtn} onPress={pickRandom} activeOpacity={0.8}>
          <Ionicons name="shuffle" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.shakeBtnText}>随机来一道</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : recipe ? (
          <TouchableOpacity onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })} activeOpacity={0.7} style={{ width: '100%' }}>
            <GlassCard style={{ padding: 24, alignItems: 'center', marginTop: 20 }}>
              <Text style={styles.resultLabel}>✨ 推荐你吃</Text>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <View style={styles.resultBadge}><Text style={styles.resultBadgeText}>{recipe.category}</Text></View>
              <Text style={styles.viewHint}>查看详情 →</Text>
            </GlassCard>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="book-outline" size={44} color={theme.textMuted} />
            <Text style={styles.emptyText}>还没有菜谱</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditRecipe')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}> 添加第一道菜</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 200, opacity: 0.35 },
  content: { flex: 1, alignItems: 'center', paddingTop: 70, paddingHorizontal: 24 },
  brandArea: { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: theme.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.textSecondary, fontWeight: '500' },
  shakeBtn: {
    flexDirection: 'row', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24,
    backgroundColor: theme.primary, alignItems: 'center',
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  shakeBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  resultLabel: { fontSize: 14, color: theme.textSecondary, marginBottom: 8 },
  recipeName: { fontSize: 26, fontWeight: '700', color: theme.text, marginBottom: 10, textAlign: 'center' },
  resultBadge: { backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  resultBadgeText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  viewHint: { marginTop: 14, fontSize: 14, color: theme.primary, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: theme.textMuted, marginTop: 12, marginBottom: 20 },
  addBtn: {
    flexDirection: 'row', backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 22, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
