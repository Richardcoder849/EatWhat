import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { deleteRecipe, getRecipeById } from '../services/recipeService';
import { addRecipeToMenu, getMenuRecipeIds, removeRecipeFromMenu } from '../services/menuService';
import { Recipe } from '../types';
import { theme } from '../theme';
import { parseRecipeList } from '../utils/recipe';
import { getRecipeCookTime, getPrimaryTag } from '../utils/recommendation';

export default function RecipeDetailScreen({ route, navigation }: any) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [inMenu, setInMenu] = useState(false);
  const [menuSaving, setMenuSaving] = useState(false);

  const loadRecipe = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedRecipe, menuIds] = await Promise.all([getRecipeById(recipeId), getMenuRecipeIds()]);
      setRecipe(loadedRecipe);
      setInMenu(menuIds.includes(recipeId));
      setCheckedIngredients([]);
      setError('');
    } catch {
      setError('菜谱加载失败');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useFocusEffect(useCallback(() => { void loadRecipe(); }, [loadRecipe]));

  function handleDelete() {
    if (!recipe || deleting) return;
    Alert.alert('删除菜谱', `确定删除「${recipe.name}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteRecipe(recipe.id);
            await removeRecipeFromMenu(recipe.id);
            navigation.goBack();
          } catch {
            setDeleting(false);
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  }

  async function handleToggleMenu() {
    if (!recipe || menuSaving) return;
    setMenuSaving(true);
    try {
      if (inMenu) {
        await removeRecipeFromMenu(recipe.id);
        setInMenu(false);
      } else {
        await addRecipeToMenu(recipe.id);
        setInMenu(true);
      }
    } finally {
      setMenuSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>;
  }
  if (!recipe || error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={34} color={theme.textMuted} />
        <Text style={styles.errorTitle}>{error || '菜谱不存在'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRecipe}><Text style={styles.retryText}>重新加载</Text></TouchableOpacity>
      </View>
    );
  }

  const ingredients = parseRecipeList(recipe.ingredients);
  const steps = parseRecipeList(recipe.steps);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {recipe.imageUri ? (
        <Image source={{ uri: recipe.imageUri }} style={styles.hero} resizeMode="cover" />
      ) : (
        <View style={[styles.hero, styles.heroPlaceholder]}><Ionicons name="restaurant-outline" size={42} color={theme.textMuted} /></View>
      )}

      <View style={styles.summary}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{recipe.name}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{recipe.category}</Text></View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}><Ionicons name="time-outline" size={16} color={theme.textSecondary} /><Text style={styles.summaryMeta}>{getRecipeCookTime(recipe)} 分钟</Text></View>
          <View style={styles.metaItem}><Ionicons name="layers-outline" size={16} color={theme.textSecondary} /><Text style={styles.summaryMeta}>{steps.length} 个步骤</Text></View>
          <View style={styles.metaItem}><Ionicons name="pricetag-outline" size={16} color={theme.textSecondary} /><Text style={styles.summaryMeta}>{getPrimaryTag(recipe)}</Text></View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}><Ionicons name="basket-outline" size={19} color={theme.primary} /><Text style={styles.sectionTitle}>食材</Text></View>
        {ingredients.map((item, index) => (
          <TouchableOpacity
            key={`${item}-${index}`}
            style={styles.listItem}
            onPress={() => setCheckedIngredients(values => values.includes(index) ? values.filter(value => value !== index) : [...values, index])}
            activeOpacity={0.7}
          >
            <View style={[styles.checkIcon, checkedIngredients.includes(index) && styles.checkIconActive]}>
              {checkedIngredients.includes(index) && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={[styles.listText, checkedIngredients.includes(index) && styles.listTextChecked]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}><Ionicons name="flame-outline" size={19} color={theme.accent} /><Text style={styles.sectionTitle}>做法</Text></View>
        {steps.map((step, index) => (
          <View key={`${step}-${index}`} style={styles.stepItem}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {!!recipe.notes && (
        <View style={styles.noteBox}>
          <View style={styles.sectionTitleRow}><Ionicons name="bulb-outline" size={19} color="#9A6514" /><Text style={styles.noteTitle}>小贴士</Text></View>
          <Text style={styles.noteText}>{recipe.notes}</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.menuButton, inMenu && styles.menuButtonActive]} onPress={handleToggleMenu} disabled={menuSaving}>
        {menuSaving ? (
          <ActivityIndicator size="small" color={inMenu ? theme.positive : theme.primary} />
        ) : (
          <Ionicons name={inMenu ? 'checkmark-circle' : 'add-circle-outline'} size={20} color={inMenu ? theme.positive : theme.primary} />
        )}
        <Text style={[styles.menuButtonText, inMenu && styles.menuButtonTextActive]}>{inMenu ? '已在今日菜单，点此移除' : '加入今日菜单'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cookButton} onPress={() => navigation.navigate('CookingMode', { recipeId })}>
        <Ionicons name="play" size={19} color="#FFFFFF" />
        <Text style={styles.cookButtonText}>开始做</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('AddEditRecipe', { recipeId })}>
          <Ionicons name="create-outline" size={19} color={theme.primary} /><Text style={styles.editText}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
          {deleting ? <ActivityIndicator size="small" color={theme.error} /> : <Ionicons name="trash-outline" size={19} color={theme.error} />}
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingBottom: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, padding: 24 },
  hero: { width: '100%', height: 270 },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surfaceMuted },
  summary: { margin: 16, marginBottom: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { flex: 1, fontSize: 27, lineHeight: 34, fontWeight: '800', color: theme.text },
  badge: { marginTop: 3, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, backgroundColor: theme.primaryBg },
  badgeText: { fontSize: 12, color: theme.primaryDark, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryMeta: { color: theme.textSecondary, fontSize: 13 },
  section: { paddingHorizontal: 16, paddingTop: 22 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 11 },
  checkIcon: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: theme.borderStrong, backgroundColor: theme.surface },
  checkIconActive: { borderColor: theme.positive, backgroundColor: theme.positive },
  listText: { flex: 1, color: theme.textSecondary, fontSize: 15, lineHeight: 22 },
  listTextChecked: { color: theme.textMuted, textDecorationLine: 'line-through' },
  divider: { height: 1, marginHorizontal: 16, marginTop: 12, backgroundColor: theme.border },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepNumber: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 11, backgroundColor: theme.primary },
  stepNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stepText: { flex: 1, color: theme.textSecondary, fontSize: 15, lineHeight: 23 },
  noteBox: { marginHorizontal: 16, marginTop: 10, padding: 15, borderRadius: 8, backgroundColor: theme.accentBg },
  noteTitle: { color: '#7A5012', fontSize: 16, fontWeight: '700' },
  noteText: { color: '#6C5635', fontSize: 14, lineHeight: 22 },
  menuButton: { minHeight: 50, marginHorizontal: 16, marginTop: 26, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.primary, borderRadius: 8, backgroundColor: theme.surface },
  menuButtonActive: { borderColor: '#B7D8BD', backgroundColor: theme.positiveBg },
  menuButtonText: { color: theme.primary, fontSize: 15, fontWeight: '800' },
  menuButtonTextActive: { color: theme.positiveDark },
  cookButton: { minHeight: 52, marginHorizontal: 16, marginTop: 10, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: theme.primary },
  cookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 10 },
  editButton: { flex: 1, minHeight: 48, borderRadius: 8, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.primary, backgroundColor: theme.surface },
  deleteButton: { flex: 1, minHeight: 48, borderRadius: 8, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8C1BC', backgroundColor: '#FFF7F6' },
  editText: { color: theme.primary, fontSize: 15, fontWeight: '700' },
  deleteText: { color: theme.error, fontSize: 15, fontWeight: '700' },
  errorTitle: { marginTop: 12, color: theme.text, fontSize: 17, fontWeight: '700' },
  retryButton: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, backgroundColor: theme.primary },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
});
