import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecipeById } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import { parseRecipeList } from '../utils/recipe';

export default function CookingModeScreen({ route, navigation }: any) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);

  useEffect(() => {
    let active = true;
    getRecipeById(route.params.recipeId)
      .then(value => { if (active) setRecipe(value); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.recipeId]);

  const steps = useMemo(() => recipe ? parseRecipeList(recipe.steps) : [], [recipe]);
  const ingredients = useMemo(() => recipe ? parseRecipeList(recipe.ingredients) : [], [recipe]);
  const total = Math.max(steps.length, 1);
  const isLastStep = stepIndex >= total - 1;

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={theme.primary} size="large" /></View>;
  }

  if (!recipe || !steps.length) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={34} color={theme.textMuted} />
        <Text style={styles.errorTitle}>暂时无法开始烹饪</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}><Text style={styles.errorButtonText}>返回菜谱</Text></TouchableOpacity>
      </View>
    );
  }

  function handleNext() {
    if (isLastStep) {
      navigation.goBack();
      return;
    }
    setStepIndex(index => Math.min(index + 1, total - 1));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} accessibilityLabel="退出烹饪模式">
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowIngredients(true)} accessibilityLabel="查看全部食材">
          <Ionicons name="basket-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((stepIndex + 1) / total) * 100}%` }]} /></View>

      <ScrollView style={styles.stepArea} contentContainerStyle={styles.stepContent}>
        <Text style={styles.eyebrow}>第 {stepIndex + 1} 步，共 {total} 步</Text>
        <Text style={styles.stepText}>{steps[stepIndex]}</Text>
        {!!recipe.notes && isLastStep && (
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={19} color="#8A5A0C" />
            <Text style={styles.tipText}>{recipe.notes}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.secondaryButton, stepIndex === 0 && styles.buttonDisabled]}
          onPress={() => setStepIndex(index => Math.max(index - 1, 0))}
          disabled={stepIndex === 0}
        >
          <Ionicons name="arrow-back" size={19} color={stepIndex === 0 ? theme.textMuted : theme.text} />
          <Text style={[styles.secondaryButtonText, stepIndex === 0 && styles.disabledText]}>上一步</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>{isLastStep ? '完成' : '下一步'}</Text>
          <Ionicons name={isLastStep ? 'checkmark' : 'arrow-forward'} size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal visible={showIngredients} transparent animationType="slide" onRequestClose={() => setShowIngredients(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowIngredients(false)} />
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>全部食材</Text>
              <Text style={styles.sheetSubtitle}>{ingredients.length} 种，做菜时随时查看</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowIngredients(false)} accessibilityLabel="关闭食材列表">
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.ingredientList}>
            {ingredients.map((ingredient, index) => (
              <View key={`${ingredient}-${index}`} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.background },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  headerTitle: { flex: 1, marginHorizontal: 8, textAlign: 'center', color: theme.text, fontSize: 16, fontWeight: '800' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 4, marginHorizontal: 16, overflow: 'hidden', borderRadius: 2, backgroundColor: theme.border },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: theme.primary },
  stepArea: { flex: 1 },
  stepContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 36 },
  eyebrow: { color: theme.primary, fontSize: 14, fontWeight: '800' },
  stepText: { marginTop: 18, color: theme.text, fontSize: 29, lineHeight: 43, fontWeight: '800' },
  tip: { marginTop: 30, flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 8, backgroundColor: theme.accentBg },
  tipText: { flex: 1, color: '#6E511F', fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface },
  secondaryButton: { flex: 1, minHeight: 52, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
  primaryButton: { flex: 1.25, minHeight: 52, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: theme.primary },
  secondaryButtonText: { color: theme.text, fontSize: 15, fontWeight: '800' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  buttonDisabled: { backgroundColor: theme.surfaceMuted },
  disabledText: { color: theme.textMuted },
  errorTitle: { marginTop: 12, color: theme.text, fontSize: 18, fontWeight: '800' },
  errorButton: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 8, backgroundColor: theme.primary },
  errorButtonText: { color: '#FFFFFF', fontWeight: '800' },
  backdrop: { flex: 1, backgroundColor: 'rgba(23, 20, 18, 0.42)' },
  sheet: { maxHeight: '72%', borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: theme.surface },
  sheetHandle: { width: 36, height: 4, alignSelf: 'center', marginTop: 8, borderRadius: 2, backgroundColor: theme.borderStrong },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  sheetTitle: { color: theme.text, fontSize: 20, fontWeight: '800' },
  sheetSubtitle: { marginTop: 3, color: theme.textSecondary, fontSize: 12 },
  ingredientList: { paddingHorizontal: 16, paddingBottom: 24 },
  ingredientRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.border },
  ingredientDot: { width: 7, height: 7, marginRight: 12, borderRadius: 4, backgroundColor: theme.positive },
  ingredientText: { flex: 1, color: theme.text, fontSize: 15, lineHeight: 21 },
});
