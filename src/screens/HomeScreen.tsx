import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllRecipes, recordRecipePick } from '../services/recipeService';
import { addRecipeToMenu, clearTodayMenu, getMenuRecipeIds, removeRecipeFromMenu } from '../services/menuService';
import { DecisionFilter, Recipe } from '../types';
import { theme } from '../theme';
import {
  getCoreIngredients,
  getIngredientMatchCount,
  getPrimaryTag,
  getRecipeCookTime,
  getRecipeTags,
  pickRecommendation,
} from '../utils/recommendation';

const FILTERS: { key: DecisionFilter; label: string }[] = [
  { key: 'all', label: '不挑' },
  { key: 'quick', label: '20分钟' },
  { key: 'light', label: '清淡' },
  { key: 'meat', label: '有肉' },
];

export default function HomeScreen({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [menuIds, setMenuIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<DecisionFilter>('all');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientDraft, setIngredientDraft] = useState<string[]>([]);
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingDecision, setSavingDecision] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [notice, setNotice] = useState('');

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const [data, storedMenuIds] = await Promise.all([getAllRecipes(), getMenuRecipeIds()]);
      setRecipes(data);
      setMenuIds(storedMenuIds);
      setRecipe(current => data.find(item => item.id === current?.id) ?? pickRecommendation(data, undefined, filter));
      setNotice('');
    } catch {
      setRecipes([]);
      setRecipe(null);
      setNotice('菜谱加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { void loadRecipes(); }, [loadRecipes]));
  useEffect(() => setImageFailed(false), [recipe?.id]);

  const ingredientOptions = useMemo(() => getCoreIngredients(recipes), [recipes]);
  const menuRecipes = useMemo(
    () => menuIds.map(id => recipes.find(item => item.id === id)).filter((item): item is Recipe => Boolean(item)),
    [menuIds, recipes]
  );
  const recentRecipes = useMemo(
    () => [...recipes]
      .filter(item => item.id !== recipe?.id)
      .sort((a, b) => {
        const recentDelta = (a.lastPickedAt ?? 0) - (b.lastPickedAt ?? 0);
        return recentDelta || a.updatedAt - b.updatedAt;
      })
      .slice(0, 2),
    [recipe?.id, recipes]
  );

  function selectRecommendation(nextFilter = filter, ingredients = selectedIngredients) {
    const next = pickRecommendation(recipes, recipe?.id, nextFilter, ingredients);
    if (!next) {
      setNotice(ingredients.length ? '没有匹配这些食材的菜，减少一种再试试' : '没有符合这个条件的菜');
      return;
    }
    setRecipe(next);
    setConfirmed(false);
    setNotice('');
  }

  function handleFilterChange(nextFilter: DecisionFilter) {
    setFilter(nextFilter);
    selectRecommendation(nextFilter, selectedIngredients);
  }

  function openIngredientFilter() {
    setIngredientDraft(selectedIngredients);
    setIngredientModalOpen(true);
  }

  function toggleIngredient(item: string) {
    setIngredientDraft(current => current.includes(item)
      ? current.filter(value => value !== item)
      : [...current, item]);
  }

  function applyIngredientFilter() {
    setSelectedIngredients(ingredientDraft);
    setIngredientModalOpen(false);
    selectRecommendation(filter, ingredientDraft);
  }

  async function handleConfirm() {
    if (!recipe || savingDecision) return;
    if (menuIds.includes(recipe.id)) {
      navigation.navigate('RecipeDetail', { recipeId: recipe.id });
      return;
    }

    setSavingDecision(true);
    try {
      const pickedAt = Date.now();
      const nextMenuIds = await addRecipeToMenu(recipe.id);
      await recordRecipePick(recipe.id);
      setMenuIds(nextMenuIds);
      setRecipes(current => current.map(item => item.id === recipe.id
        ? { ...item, lastPickedAt: pickedAt, pickCount: (item.pickCount ?? 0) + 1 }
        : item));
      setRecipe(current => current ? {
        ...current,
        lastPickedAt: pickedAt,
        pickCount: (current.pickCount ?? 0) + 1,
      } : current);
      setConfirmed(true);
    } catch {
      setNotice('记录失败，但仍可以查看菜谱');
    } finally {
      setSavingDecision(false);
    }
  }

  async function handleRemoveFromMenu(recipeId: number) {
    const nextMenuIds = await removeRecipeFromMenu(recipeId);
    setMenuIds(nextMenuIds);
    if (recipe?.id === recipeId) setConfirmed(false);
  }

  async function handleClearMenu() {
    await clearTodayMenu();
    setMenuIds([]);
    setConfirmed(false);
  }

  async function handleShareMenu() {
    if (!menuRecipes.length) return;
    const lines = menuRecipes.map((item, index) => `${index + 1}. ${item.name}（约${getRecipeCookTime(item)}分钟）`);
    await Share.share({
      title: '今日菜单',
      message: `今天想吃：\n${lines.join('\n')}\n\n菜单来自「吃什么？」`,
    });
  }

  const cookTime = recipe ? getRecipeCookTime(recipe) : 0;
  const tags = recipe ? getRecipeTags(recipe) : [];
  const ingredientMatches = recipe ? getIngredientMatchCount(recipe, selectedIngredients) : 0;
  const recipeInMenu = recipe ? menuIds.includes(recipe.id) : false;
  const totalMenuTime = menuRecipes.reduce((total, item) => total + getRecipeCookTime(item), 0);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>今天吃什么？</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerAction} onPress={openIngredientFilter} accessibilityLabel="按食材筛选">
              <Ionicons name="basket-outline" size={19} color={selectedIngredients.length ? theme.positive : theme.text} />
              <Text style={[styles.headerActionText, selectedIngredients.length > 0 && styles.headerActionTextActive]}>食材</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('DecisionHistory')} accessibilityLabel="查看决定历史">
              <Ionicons name="time-outline" size={20} color={theme.text} />
              <Text style={styles.headerActionText}>历史</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!!menuRecipes.length && (
          <View style={styles.menuSection}>
            <View style={styles.menuHeader}>
              <View style={styles.menuTitleRow}>
                <Text style={styles.menuTitle}>今日菜单</Text>
                <View style={styles.menuCount}><Text style={styles.menuCountText}>{menuRecipes.length} 道</Text></View>
              </View>
              <View style={styles.menuHeaderActions}>
                <TouchableOpacity style={styles.menuHeaderButton} onPress={handleShareMenu} accessibilityLabel="分享今日菜单">
                  <Ionicons name="share-social-outline" size={18} color={theme.primary} />
                  <Text style={styles.menuHeaderButtonText}>分享</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearMenu}><Text style={styles.clearButtonText}>清空</Text></TouchableOpacity>
              </View>
            </View>
            {menuRecipes.map((item, index) => (
              <View key={item.id} style={[styles.menuRow, index > 0 && styles.menuRowBorder]}>
                <TouchableOpacity style={styles.menuRowMain} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}>
                  <View style={styles.menuIndex}><Text style={styles.menuIndexText}>{index + 1}</Text></View>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuRecipeName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.menuRecipeMeta}>{getRecipeCookTime(item)}分钟 · {getPrimaryTag(item)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeMenuButton} onPress={() => handleRemoveFromMenu(item.id)} accessibilityLabel={`从菜单移除${item.name}`}>
                  <Ionicons name="close" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.menuFooter}>
              <Ionicons name="information-circle-outline" size={16} color={theme.positive} />
              <Text style={styles.menuFooterText}>预计共 {totalMenuTime} 分钟，点菜后直接发给做饭的人</Text>
            </View>
          </View>
        )}

        <View style={styles.heroSection}>
          {loading ? (
            <View style={[styles.heroImage, styles.center]}><ActivityIndicator color={theme.primary} /></View>
          ) : recipe && recipe.imageUri && !imageFailed ? (
            <Image source={{ uri: recipe.imageUri }} style={styles.heroImage} resizeMode="cover" onError={() => setImageFailed(true)} />
          ) : (
            <View style={[styles.heroImage, styles.center, styles.imageFallback]}>
              <Ionicons name="restaurant-outline" size={44} color={theme.textMuted} />
              <Text style={styles.imageFallbackText}>{recipe ? '这道菜还没有图片' : '先添加一道常做的菜'}</Text>
            </View>
          )}

          {recipe && (
            <View style={styles.resultBody}>
              <View style={styles.resultTitleRow}>
                <View style={styles.resultTitleWrap}>
                  <Text style={styles.recipeName} numberOfLines={2}>{recipe.name}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={18} color={theme.positive} />
                      <Text style={styles.metaText}>{cookTime}分钟</Text>
                    </View>
                    <Text style={styles.metaSeparator}>·</Text>
                    <View style={styles.metaItem}>
                      <Ionicons name="restaurant-outline" size={18} color={theme.positive} />
                      <Text style={styles.metaText}>{tags[1] ?? getPrimaryTag(recipe)}</Text>
                    </View>
                    {!!selectedIngredients.length && (
                      <>
                        <Text style={styles.metaSeparator}>·</Text>
                        <Text style={styles.matchText}>匹配 {ingredientMatches} 种</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.bookmark}>
                  <Ionicons name="bookmark" size={22} color={theme.accent} />
                </View>
              </View>

              <View style={styles.filters}>
                {FILTERS.map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
                    onPress={() => handleFilterChange(item.key)}
                  >
                    <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {!!selectedIngredients.length && (
                <TouchableOpacity style={styles.ingredientSummary} onPress={openIngredientFilter}>
                  <Ionicons name="leaf-outline" size={17} color={theme.positive} />
                  <Text style={styles.ingredientSummaryText} numberOfLines={1}>按 {selectedIngredients.join('、')} 推荐</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.positive} />
                </TouchableOpacity>
              )}

              {!!notice && <Text style={styles.notice}>{notice}</Text>}

              <TouchableOpacity
                style={[styles.primaryButton, recipeInMenu && styles.confirmedButton]}
                onPress={handleConfirm}
                disabled={!recipe || savingDecision}
              >
                {savingDecision ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons name={recipeInMenu ? 'checkmark-circle' : 'add-circle'} size={21} color="#FFFFFF" />
                )}
                <Text style={styles.primaryButtonText}>{recipeInMenu ? '已加入，查看做法' : '加入今日菜单'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shuffleButton} onPress={() => selectRecommendation()} disabled={!recipes.length}>
                <Ionicons name="shuffle" size={20} color={theme.textSecondary} />
                <Text style={styles.shuffleText}>换一道</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!!recentRecipes.length && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>最近没吃</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RecipeList')}>
                <Text style={styles.sectionLink}>查看全部</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentList}>
              {recentRecipes.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.recentRow, index > 0 && styles.recentRowBorder]}
                  onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
                >
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.recentImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.recentImage, styles.center, styles.imageFallback]}>
                      <Ionicons name="restaurant-outline" size={22} color={theme.textMuted} />
                    </View>
                  )}
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.recentMeta}>{getRecipeCookTime(item)}分钟 · {getPrimaryTag(item)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={ingredientModalOpen} transparent animationType="slide" onRequestClose={() => setIngredientModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setIngredientModalOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>手头有什么食材？</Text>
                <Text style={styles.sheetSubtitle}>选一两样就够，推荐会优先匹配</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIngredientModalOpen(false)} accessibilityLabel="关闭">
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.ingredientGrid}>
              {ingredientOptions.map(item => {
                const active = ingredientDraft.includes(item);
                return (
                  <TouchableOpacity key={item} style={[styles.ingredientChip, active && styles.ingredientChipActive]} onPress={() => toggleIngredient(item)}>
                    <Ionicons name={active ? 'checkmark-circle' : 'add-circle-outline'} size={17} color={active ? theme.positive : theme.textMuted} />
                    <Text style={[styles.ingredientChipText, active && styles.ingredientChipTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={applyIngredientFilter}>
              <Text style={styles.applyButtonText}>{ingredientDraft.length ? `按 ${ingredientDraft.length} 种食材推荐` : '清除食材筛选'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 26 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  brand: { flexShrink: 1, color: theme.text, fontSize: 28, lineHeight: 34, fontWeight: '900' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerAction: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, borderRadius: 7 },
  headerActionText: { color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  headerActionTextActive: { color: theme.positive },
  menuSection: { overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: '#E8CBC7', borderRadius: 8, backgroundColor: theme.surface },
  menuHeader: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13, backgroundColor: '#FFF5F3' },
  menuTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuTitle: { color: theme.text, fontSize: 17, fontWeight: '900' },
  menuCount: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: theme.primaryBg },
  menuCountText: { color: theme.primaryDark, fontSize: 11, fontWeight: '800' },
  menuHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuHeaderButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7 },
  menuHeaderButtonText: { color: theme.primary, fontSize: 13, fontWeight: '800' },
  clearButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 7 },
  clearButtonText: { color: theme.textMuted, fontSize: 12, fontWeight: '700' },
  menuRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingLeft: 12 },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: theme.border },
  menuRowMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  menuIndex: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: theme.primary },
  menuIndexText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  menuInfo: { flex: 1, minWidth: 0, marginHorizontal: 10 },
  menuRecipeName: { color: theme.text, fontSize: 15, fontWeight: '800' },
  menuRecipeMeta: { marginTop: 3, color: theme.positiveDark, fontSize: 12, fontWeight: '600' },
  removeMenuButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  menuFooter: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.positiveBg },
  menuFooterText: { flex: 1, color: theme.positiveDark, fontSize: 12, lineHeight: 17 },
  heroSection: { overflow: 'hidden', borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  heroImage: { width: '100%', aspectRatio: 1.62, maxHeight: 320, backgroundColor: theme.surfaceMuted },
  imageFallback: { backgroundColor: theme.surfaceMuted },
  imageFallbackText: { marginTop: 8, color: theme.textMuted, fontSize: 13 },
  resultBody: { padding: 15 },
  resultTitleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  resultTitleWrap: { flex: 1, minWidth: 0 },
  recipeName: { color: theme.text, fontSize: 27, lineHeight: 33, fontWeight: '900' },
  bookmark: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  metaRow: { minHeight: 24, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: theme.positiveDark, fontSize: 14, fontWeight: '600' },
  metaSeparator: { marginHorizontal: 8, color: theme.textMuted },
  matchText: { color: theme.positive, fontSize: 13, fontWeight: '800' },
  filters: { flexDirection: 'row', gap: 7, marginTop: 16 },
  filterButton: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 7, backgroundColor: theme.surfaceMuted },
  filterButtonActive: { borderColor: theme.primary, backgroundColor: theme.primary },
  filterText: { color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  ingredientSummary: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 10, borderRadius: 7, backgroundColor: theme.positiveBg },
  ingredientSummaryText: { flex: 1, color: theme.positiveDark, fontSize: 13, fontWeight: '700' },
  notice: { marginTop: 9, color: theme.error, fontSize: 12, lineHeight: 18 },
  primaryButton: { minHeight: 50, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: 8, backgroundColor: theme.primary },
  confirmedButton: { backgroundColor: theme.positive },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  shuffleButton: { minHeight: 46, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 9, borderWidth: 1, borderColor: theme.borderStrong, borderRadius: 8, backgroundColor: theme.surface },
  shuffleText: { color: theme.textSecondary, fontSize: 15, fontWeight: '700' },
  recentSection: { marginTop: 23 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '900' },
  sectionLink: { color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  recentList: { overflow: 'hidden', borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  recentRow: { minHeight: 84, flexDirection: 'row', alignItems: 'center', padding: 9 },
  recentRowBorder: { borderTopWidth: 1, borderTopColor: theme.border },
  recentImage: { width: 92, height: 66, borderRadius: 6, backgroundColor: theme.surfaceMuted },
  recentInfo: { flex: 1, minWidth: 0, marginHorizontal: 12 },
  recentName: { color: theme.text, fontSize: 16, fontWeight: '800' },
  recentMeta: { marginTop: 5, color: theme.positiveDark, fontSize: 12, fontWeight: '600' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.overlay },
  modalDismissArea: { flex: 1 },
  sheet: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 28, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: theme.surface },
  sheetHandle: { width: 38, height: 4, alignSelf: 'center', marginTop: 8, marginBottom: 18, borderRadius: 2, backgroundColor: theme.borderStrong },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  sheetTitle: { color: theme.text, fontSize: 21, fontWeight: '900' },
  sheetSubtitle: { marginTop: 4, color: theme.textSecondary, fontSize: 13 },
  closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: theme.surfaceMuted },
  ingredientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  ingredientChip: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  ingredientChipActive: { borderColor: '#B7D8BD', backgroundColor: theme.positiveBg },
  ingredientChipText: { color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  ingredientChipTextActive: { color: theme.positiveDark },
  applyButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 22, borderRadius: 8, backgroundColor: theme.primary },
  applyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
