import { getDatabase } from '../database/database';
import { Recipe } from '../types';

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Recipe>('SELECT * FROM recipes ORDER BY updatedAt DESC');
}

export async function getRecipeById(id: number): Promise<Recipe | null> {
  const db = await getDatabase();
  return (await db.getFirstAsync<Recipe>('SELECT * FROM recipes WHERE id = ?', [id])) || null;
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
  return (await db.getFirstAsync<Recipe>('SELECT * FROM recipes ORDER BY RANDOM() LIMIT 1')) || null;
}

export async function addRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO recipes (name, category, ingredients, steps, notes, imageUri, cookTime, tags, lastPickedAt, pickCount, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipe.name,
      recipe.category,
      recipe.ingredients,
      recipe.steps,
      recipe.notes,
      recipe.imageUri,
      recipe.cookTime ?? 30,
      recipe.tags ?? '[]',
      recipe.lastPickedAt ?? 0,
      recipe.pickCount ?? 0,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateRecipe(recipe: Omit<Recipe, 'createdAt' | 'updatedAt'>): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `UPDATE recipes
     SET name = ?, category = ?, ingredients = ?, steps = ?, notes = ?, imageUri = ?, cookTime = ?, tags = ?, updatedAt = ?
     WHERE id = ?`,
    [
      recipe.name,
      recipe.category,
      recipe.ingredients,
      recipe.steps,
      recipe.notes,
      recipe.imageUri,
      recipe.cookTime ?? 30,
      recipe.tags ?? '[]',
      now,
      recipe.id,
    ]
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
  return result.map(row => row.category);
}

export async function getRecipeCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
  return result?.count ?? 0;
}

export async function recordRecipePick(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE recipes SET lastPickedAt = ?, pickCount = COALESCE(pickCount, 0) + 1 WHERE id = ?',
    [Date.now(), id]
  );
}

export async function getDecisionHistory(): Promise<Recipe[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Recipe>(
    'SELECT * FROM recipes WHERE lastPickedAt > 0 ORDER BY lastPickedAt DESC'
  );
}

export async function seedRecipes(recipes: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM recipes');
    if ((result?.count ?? 0) > 0) return;

    const now = Date.now();
    for (const [index, recipe] of recipes.entries()) {
      await db.runAsync(
        `INSERT INTO recipes (name, category, ingredients, steps, notes, imageUri, cookTime, tags, lastPickedAt, pickCount, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.name,
          recipe.category,
          recipe.ingredients,
          recipe.steps,
          recipe.notes,
          recipe.imageUri,
          recipe.cookTime ?? 30,
          recipe.tags ?? '[]',
          0,
          0,
          now + index,
          now + index,
        ]
      );
    }
  });
}
