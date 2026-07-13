import { Recipe } from '../types';
import { SEED_VERSION } from '../data/seedRecipes';

const STORAGE_KEY = '@eatwhat:recipes';
const VERSION_KEY = '@eatwhat:seed_version';

function checkVersion(): void {
  const saved = localStorage.getItem(VERSION_KEY);
  if (saved !== String(SEED_VERSION)) {
    localStorage.setItem(VERSION_KEY, String(SEED_VERSION));
  }
}

function load(): Recipe[] {
  checkVersion();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const recipes: Recipe[] = raw ? JSON.parse(raw) : [];
    return recipes.map(recipe => ({
      ...recipe,
      cookTime: recipe.cookTime ?? 30,
      tags: recipe.tags ?? '[]',
      lastPickedAt: recipe.lastPickedAt ?? 0,
      pickCount: recipe.pickCount ?? 0,
    }));
  } catch {
    return [];
  }
}

function save(recipes: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

let nextId = Date.now();

function getNextId(): number {
  return nextId++;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const data = load();
  return data.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
  const data = load();
  return data.find(r => r.id === id) || null;
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const data = load();
  const q = query.toLowerCase();
  return data
    .filter(r => r.name.toLowerCase().includes(q) || r.ingredients.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  const data = load();
  return data
    .filter(r => r.category === category)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getRandomRecipe(): Promise<Recipe | null> {
  const data = load();
  if (data.length === 0) return null;
  return data[Math.floor(Math.random() * data.length)];
}

export async function addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const data = load();
  const now = Date.now();
  const newRecipe: Recipe = {
    id: getNextId(),
    ...recipe,
    createdAt: now,
    updatedAt: now,
  };
  data.push(newRecipe);
  save(data);
  return newRecipe.id;
}

export async function updateRecipe(recipe: Omit<Recipe, 'createdAt' | 'updatedAt'>): Promise<void> {
  const data = load();
  const index = data.findIndex(r => r.id === recipe.id);
  if (index !== -1) {
    data[index] = { ...data[index], ...recipe, updatedAt: Date.now() };
    save(data);
  }
}

export async function deleteRecipe(id: number): Promise<void> {
  const data = load();
  save(data.filter(r => r.id !== id));
}

export async function getCategories(): Promise<string[]> {
  const data = load();
  return Array.from(new Set(data.map(r => r.category))).sort();
}

export async function getRecipeCount(): Promise<number> {
  return load().length;
}

export async function recordRecipePick(id: number): Promise<void> {
  const data = load();
  const recipe = data.find(item => item.id === id);
  if (!recipe) return;
  recipe.lastPickedAt = Date.now();
  recipe.pickCount = (recipe.pickCount ?? 0) + 1;
  save(data);
}

export async function getDecisionHistory(): Promise<Recipe[]> {
  return load()
    .filter(recipe => (recipe.lastPickedAt ?? 0) > 0)
    .sort((a, b) => (b.lastPickedAt ?? 0) - (a.lastPickedAt ?? 0));
}

export async function seedRecipes(recipes: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
  const count = await getRecipeCount();
  if (count > 0) return;
  for (const recipe of recipes) {
    await addRecipe(recipe);
  }
}
