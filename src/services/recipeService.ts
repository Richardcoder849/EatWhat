import { getDatabase } from '../database/database';
import { Recipe } from '../types';

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Recipe>(
    'SELECT * FROM recipes ORDER BY updatedAt DESC'
  );
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
  const db = await getDatabase();
  return (await db.getFirstAsync<Recipe>(
    'SELECT * FROM recipes WHERE id = ?',
    [id]
  )) || null;
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Recipe>(
    'SELECT * FROM recipes WHERE name LIKE ? OR ingredients LIKE ? ORDER BY updatedAt DESC',
    [`%${query}%`, `%${query}%`]
  );
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Recipe>(
    'SELECT * FROM recipes WHERE category = ? ORDER BY updatedAt DESC',
    [category]
  );
}

export async function getRandomRecipe(): Promise<Recipe | null> {
  const db = await getDatabase();
  return (await db.getFirstAsync<Recipe>(
    'SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1'
  )) || null;
}

export async function addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO recipes (name, category, ingredients, steps, notes, imageUri, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [recipe.name, recipe.category, recipe.ingredients, recipe.steps, recipe.notes, recipe.imageUri, now, now]
  );
  return result.lastInsertRowId;
}

export async function updateRecipe(recipe: Omit<Recipe, 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `UPDATE recipes SET name = ?, category = ?, ingredients = ?, steps = ?, notes = ?, imageUri = ?, updatedAt = ?
     WHERE id = ?`,
    [recipe.name, recipe.category, recipe.ingredients, recipe.steps, recipe.notes, recipe.imageUri, now, recipe.id]
  );
}

export async function deleteRecipe(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

export async function getCategories(): Promise<string[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<{ category: string }>(
    'SELECT DISTINCT category FROM recipes ORDER BY category'
  );
  return result.map(r => r.category);
}

export async function getRecipeCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
  return result?.count ?? 0;
}

export async function seedRecipes(recipes: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
  const count = await getRecipeCount();
  if (count > 0) return;
  for (const recipe of recipes) {
    await addRecipe(recipe);
  }
}
