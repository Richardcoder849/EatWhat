import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllRecipes, searchRecipes, getRecipesByCategory } from '../services/recipeService';
import { Recipe } from '../types';
import { theme } from '../theme';
import RecipeCard from '../components/RecipeCard';

const bgGrad = Platform.OS === 'web'
  ? { background: 'linear-gradient(180deg, #F2F5EE 0%, #EAF0E4 50%, #E5EDDC 100%)' }
  : { backgroundColor: theme.background };

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
    <View style={[styles.container, bgGrad]}>
      <View style={[styles.blob, { width: 220, height: 220, top: -60, right: -60, backgroundColor: '#A8D86B' }]} />
      <View style={[styles.blob, { width: 160, height: 160, bottom: 80, left: -40, backgroundColor: '#86C84B' }]} />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={theme.textMuted} />
        <TextInput style={styles.searchInput} placeholder="搜索菜谱或食材..." placeholderTextColor={theme.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color={theme.textMuted} /></TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
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
            <Ionicons name="book-outline" size={44} color={theme.textMuted} />
            <Text style={styles.emptyText}>还没有菜谱</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditRecipe')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}> 添加菜谱</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 200, opacity: 0.3 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 6,
    paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)', marginTop: 50,
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 15, color: theme.text },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.65)', marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)' },
  chipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipText: { fontSize: 14, color: theme.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: theme.textMuted, marginTop: 12, marginBottom: 20 },
  addBtn: { flexDirection: 'row', backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 22, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
