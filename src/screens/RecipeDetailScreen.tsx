import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipeById, deleteRecipe } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';
import AppBackground from '../components/AppBackground';

export default function RecipeDetailScreen({ route, navigation }: any) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { loadRecipe(); }, [recipeId]));

  async function loadRecipe() {
    setLoading(true);
    try { setRecipe(await getRecipeById(recipeId)); } catch {}
    setLoading(false);
  }

  function handleEdit() { navigation.navigate('AddEditRecipe', { recipeId }); }

  function handleDelete() {
    if (!recipe) return;
    Alert.alert('删除菜谱', `确定删除「${recipe.name}」吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => { await deleteRecipe(recipe.id); navigation.goBack(); } },
    ]);
  }

  if (loading) return <AppBackground><View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View></AppBackground>;
  if (!recipe) return <AppBackground><View style={styles.center}><Text style={{ color: theme.textMuted }}>菜谱不存在</Text></View></AppBackground>;

  const ingredients: string[] = JSON.parse(recipe.ingredients);
  const steps: string[] = JSON.parse(recipe.steps);

  return (
    <AppBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {recipe.imageUri ? (
          <Image source={{ uri: recipe.imageUri }} style={styles.hero} />
        ) : (
          <View style={styles.heroPlaceholder}><Ionicons name="restaurant-outline" size={42} color={theme.primary} /></View>
        )}

        <GlassCard style={styles.nameCard}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>今日开做</Text>
              <Text style={styles.name}>{recipe.name}</Text>
            </View>
            <View style={styles.badge}><Text style={styles.badgeText}>{recipe.category}</Text></View>
          </View>
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}><Ionicons name="basket" size={18} color={theme.primary} /><Text style={styles.sectionTitle}>食材</Text></View>
          {ingredients.map((item, i) => (
            <View key={i} style={styles.listItem}><View style={styles.bullet} /><Text style={styles.listText}>{item}</Text></View>
          ))}
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}><Ionicons name="flame" size={18} color={theme.primary} /><Text style={styles.sectionTitle}>做法</Text></View>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </GlassCard>

        {recipe.notes ? (
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}><Ionicons name="bulb" size={18} color={theme.primary} /><Text style={styles.sectionTitle}>备注</Text></View>
            <Text style={styles.notesText}>{recipe.notes}</Text>
          </GlassCard>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEdit}>
            <Ionicons name="create-outline" size={18} color={theme.primary} /><Text style={[styles.actionBtnText, { color: theme.primary }]}> 编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color="#fff" /><Text style={[styles.actionBtnText, { color: '#fff' }]}> 删除</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 104 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { width: '100%', height: 280, resizeMode: 'cover' },
  heroPlaceholder: { width: '100%', height: 280, backgroundColor: theme.primaryBg, justifyContent: 'center', alignItems: 'center' },
  nameCard: { padding: 20, marginHorizontal: 16, marginTop: -34, zIndex: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kicker: { fontSize: 12, fontWeight: '800', color: theme.primaryDark, marginBottom: 4 },
  name: { fontSize: 25, fontWeight: '900', color: theme.text, flex: 1 },
  badge: { backgroundColor: theme.ink, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  sectionCard: { padding: 20, marginHorizontal: 16, marginTop: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: theme.text },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  bullet: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.accent, marginRight: 10 },
  listText: { fontSize: 15, color: theme.textSecondary, flex: 1, lineHeight: 22 },
  stepItem: { flexDirection: 'row', marginBottom: 13 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  stepText: { fontSize: 15, color: theme.textSecondary, flex: 1, lineHeight: 23 },
  notesText: { fontSize: 14, color: theme.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', marginHorizontal: 16, marginTop: 24, gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  editBtn: { backgroundColor: theme.glass, borderWidth: 1, borderColor: theme.primary },
  deleteBtn: { backgroundColor: theme.error },
  actionBtnText: { fontSize: 15, fontWeight: '800' },
});
