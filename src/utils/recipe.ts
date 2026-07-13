import { Recipe } from '../types';

export function parseRecipeList(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean);
    }
  } catch {
    // Older or manually imported data may be plain text.
  }

  return value
    .split(/\r?\n|[,，]/)
    .map(item => item.trim())
    .filter(Boolean);
}

export function recipeMatches(recipe: Recipe, query: string, category: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesCategory = category === '全部' || recipe.category === category;
  if (!matchesCategory || !normalizedQuery) return matchesCategory;

  return [recipe.name, recipe.category, ...parseRecipeList(recipe.ingredients)]
    .some(value => value.toLocaleLowerCase().includes(normalizedQuery));
}
