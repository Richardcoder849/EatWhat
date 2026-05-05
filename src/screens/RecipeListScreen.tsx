import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllRecipes, searchRecipes, getRecipesByCategory } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import RecipeCard from '../components/RecipeCard';
import AppBackground from '../components/AppBackground';

const CATEGORIES = ['全部', '中餐', '西餐', '日料', '甜点', '汤羹', '早餐', '小吃', '饮品', '其他'];

export default function RecipeListScreen({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useFocusEffect(useCallback(() => { loadRecipes(); }, [selectedCategory, searchQuery]));

  async function loadRecipes() {
    try {
      let data: Recipe[];
      if (searchQuery.trim()) data = await searchRecipes(searchQuery.trim());
      else if (selectedCategory !== '全部') data = await getRecipesByCategory(selectedCategory);
      else data = await getAllRecipes();
      setRecipes(data);
    } catch {}
  }

  return (
    <AppBackground>
      <View style={styles.header}>
        <Text style={styles.title}>菜单库</Text>
        <TouchableOpacity style={styles.headerAdd} onPress={() => navigation.navigate('AddEditRecipe')}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索菜谱或食材..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color={theme.textMuted} /></TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selectedCategory === item && styles.chipActive]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={recipes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard
            name={item.name}
            category={item.category}
            ingredientCount={JSON.parse(item.ingredients).length}
            stepCount={JSON.parse(item.steps).length}
            imageUri={item.imageUri}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="restaurant-outline" size={46} color={theme.textMuted} />
            <Text style={styles.emptyText}>还没有匹配的菜谱</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditRecipe')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>添加菜谱</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 54,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 28, fontWeight: '900', color: theme.text },
  headerAdd: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  searchInput: { flex: 1, paddingVertical: 11, paddingHorizontal: 8, fontSize: 15, color: theme.text },
  chipList: { paddingHorizontal: 16, paddingBottom: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: theme.glass, marginRight: 8, borderWidth: 1, borderColor: theme.glassBorder },
  chipActive: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipText: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '800' },
  listContent: { paddingBottom: 86, paddingTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 24 },
  emptyText: { fontSize: 16, color: theme.textMuted, marginTop: 12, marginBottom: 20 },
  addBtn: { flexDirection: 'row', gap: 4, backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
