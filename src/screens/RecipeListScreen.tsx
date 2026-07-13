import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllRecipes } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import RecipeCard from '../components/RecipeCard';
import { parseRecipeList, recipeMatches } from '../utils/recipe';
import { getRecipeCookTime } from '../utils/recommendation';

const CATEGORIES = ['全部', '中餐', '西餐', '日料', '甜点', '汤羹', '早餐', '小吃', '饮品', '其他'];

export default function RecipeListScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const columns = width >= 720 ? 3 : 2;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadRecipes = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      setRecipes(await getAllRecipes());
      setError('');
    } catch {
      setError('菜谱加载失败，请下拉重试');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadRecipes(); }, [loadRecipes]));

  const visibleRecipes = useMemo(
    () => recipes.filter(recipe => recipeMatches(recipe, searchQuery, selectedCategory)),
    [recipes, searchQuery, selectedCategory]
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWidth}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>我的菜谱</Text>
            <Text style={styles.subtitle}>{visibleRecipes.length === recipes.length ? `共 ${recipes.length} 道` : `找到 ${visibleRecipes.length} 道`}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddEditRecipe')} accessibilityLabel="添加菜谱">
            <Ionicons name="add" size={25} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={19} color={theme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索菜名或食材"
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="清空搜索">
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoryContent}>
          {CATEGORIES.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, selectedCategory === item && styles.chipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!!error && <Text style={[styles.errorText, styles.contentWidth]}>{error}</Text>}

      <FlatList
        key={columns}
        data={visibleRecipes}
        numColumns={columns}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.cardCell, { maxWidth: `${100 / columns}%` }]}>
            <RecipeCard
              name={item.name}
              category={item.category}
              cookTime={getRecipeCookTime(item)}
              ingredientCount={parseRecipeList(item.ingredients).length}
              imageUri={item.imageUri}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRecipes(true)} colors={[theme.primary]} tintColor={theme.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name={recipes.length ? 'search-outline' : 'book-outline'} size={38} color={theme.textMuted} />
            <Text style={styles.emptyTitle}>{recipes.length ? '没有匹配的菜谱' : '还没有菜谱'}</Text>
            <Text style={styles.emptyText}>{recipes.length ? '换个关键词或分类试试' : '点击右上角添加第一道菜'}</Text>
          </View>
        }
        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
        contentContainerStyle={[styles.listContent, !visibleRecipes.length && styles.emptyListContent]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  contentWidth: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, marginBottom: 15 },
  title: { color: theme.text, fontSize: 28, fontWeight: '900' },
  subtitle: { marginTop: 3, color: theme.textSecondary, fontSize: 13, fontWeight: '600' },
  addButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: theme.primary },
  searchBar: { minHeight: 46, flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 13, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 9, color: theme.text, fontSize: 15 },
  categories: { flexGrow: 0, marginTop: 11, marginBottom: 11 },
  categoryContent: { paddingHorizontal: 16 },
  chip: { height: 34, justifyContent: 'center', paddingHorizontal: 14, marginRight: 7, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface },
  chipActive: { borderColor: theme.primary, backgroundColor: theme.primary },
  chipText: { color: theme.textSecondary, fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  errorText: { paddingHorizontal: 16, marginBottom: 8, color: theme.error, fontSize: 13 },
  listContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 11, paddingBottom: 30 },
  emptyListContent: { flexGrow: 1 },
  gridRow: { alignItems: 'stretch' },
  cardCell: { flex: 1, minWidth: 0, padding: 5 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { marginTop: 12, color: theme.text, fontSize: 17, fontWeight: '800' },
  emptyText: { marginTop: 4, color: theme.textSecondary, fontSize: 13 },
});
