import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipeById, deleteRecipe } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import GlassCard from '../components/GlassCard';

const bgGrad = Platform.OS === 'web'
  ? { background: 'linear-gradient(180deg, #F2F5EE 0%, #EAF0E4 50%, #E5EDDC 100%)' }
  : { backgroundColor: theme.background };

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

  if (loading) return <View style={[styles.center, bgGrad]}><ActivityIndicator size="large" color={theme.primary} /></View>;
  if (!recipe) return <View style={[styles.center, bgGrad]}><Text style={{ color: theme.textMuted }}>菜谱不存在</Text></View>;

  const ingredients: string[] = JSON.parse(recipe.ingredients);
  const steps: string[] = JSON.parse(recipe.steps);

  return (
    <ScrollView style={[styles.container, bgGrad]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.blob, { width: 240, height: 240, top: -80, right: -60, backgroundColor: '#A8D86B' }]} />
      <View style={[styles.blob, { width: 180, height: 180, bottom: 80, left: -50, backgroundColor: '#86C84B' }]} />

      {recipe.imageUri ? (
        <Image source={{ uri: recipe.imageUri }} style={styles.hero} />
      ) : (
        <View style={styles.heroPlaceholder}><Ionicons name="image-outline" size={40} color={theme.textMuted} /></View>
      )}

      <GlassCard style={{ padding: 20, marginHorizontal: 16, marginTop: -30, zIndex: 10 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{recipe.name}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{recipe.category}</Text></View>
        </View>
      </GlassCard>

      <GlassCard style={{ padding: 20, marginHorizontal: 16, marginTop: 14 }}>
        <View style={styles.sectionTitleRow}><Ionicons name="basket" size={18} color={theme.primary} /><Text style={styles.sectionTitle}> 食材</Text></View>
        {ingredients.map((item, i) => (
          <View key={i} style={styles.listItem}><View style={styles.bullet} /><Text style={styles.listText}>{item}</Text></View>
        ))}
      </GlassCard>

      <GlassCard style={{ padding: 20, marginHorizontal: 16, marginTop: 14 }}>
        <View style={styles.sectionTitleRow}><Ionicons name="flame" size={18} color={theme.primary} /><Text style={styles.sectionTitle}> 做法</Text></View>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </GlassCard>

      {recipe.notes ? (
        <GlassCard style={{ padding: 20, marginHorizontal: 16, marginTop: 14 }}>
          <View style={styles.sectionTitleRow}><Ionicons name="bulb" size={18} color={theme.primary} /><Text style={styles.sectionTitle}> 备注</Text></View>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blob: { position: 'absolute', borderRadius: 200, opacity: 0.3 },
  hero: { width: '100%', height: 260, resizeMode: 'cover' },
  heroPlaceholder: { width: '100%', height: 260, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 24, fontWeight: '700', color: theme.text, flex: 1 },
  badge: { backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.text },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary, marginRight: 10 },
  listText: { fontSize: 15, color: theme.textSecondary, flex: 1, lineHeight: 22 },
  stepItem: { flexDirection: 'row', marginBottom: 12 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 15, color: theme.textSecondary, flex: 1, lineHeight: 22 },
  notesText: { fontSize: 14, color: theme.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  actions: { flexDirection: 'row', marginHorizontal: 16, marginTop: 24, gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.65)', borderWidth: 1, borderColor: theme.primary },
  deleteBtn: { backgroundColor: theme.error },
  actionBtnText: { fontSize: 15, fontWeight: '600' },
});
