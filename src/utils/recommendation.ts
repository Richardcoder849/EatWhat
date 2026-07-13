import { DecisionFilter, Recipe } from '../types';
import { parseRecipeList } from './recipe';

const MEAT_PATTERN = /猪|牛|羊|鸡|鸭|鹅|肉|排骨|鸡翅|火腿|虾|鱼|蟹/;
const LIGHT_PATTERN = /清淡|素|蔬菜|青菜|西兰花|汤|羹|蒸/;
const DEFAULT_COOK_TIMES: Record<string, number> = {
  红烧肉: 55,
  番茄炒蛋: 15,
  麻婆豆腐: 20,
  可乐鸡翅: 25,
  蒜蓉西兰花: 12,
  蛋炒饭: 15,
  酸辣汤: 18,
  糖醋排骨: 35,
};

export function getRecipeCookTime(recipe: Recipe): number {
  if ((!recipe.tags || recipe.tags === '[]') && DEFAULT_COOK_TIMES[recipe.name]) {
    return DEFAULT_COOK_TIMES[recipe.name];
  }
  if (recipe.cookTime && recipe.cookTime > 0) return recipe.cookTime;
  return Math.max(10, Math.min(60, parseRecipeList(recipe.steps).length * 5));
}

export function getRecipeTags(recipe: Recipe): string[] {
  try {
    const parsed = recipe.tags ? JSON.parse(recipe.tags) : [];
    if (Array.isArray(parsed) && parsed.length) return parsed.filter(Boolean).map(String);
  } catch {
    // Legacy plain-text tags are handled by the derived labels below.
  }

  const source = `${recipe.name} ${recipe.category} ${recipe.ingredients} ${recipe.notes}`;
  const tags: string[] = [];
  if (getRecipeCookTime(recipe) <= 20) tags.push('快手');
  if (LIGHT_PATTERN.test(source)) tags.push('清淡');
  if (MEAT_PATTERN.test(source)) tags.push('有肉');
  if (/辣|麻婆|酸辣/.test(source)) tags.push('微辣');
  if (/饭|下饭|红烧|糖醋|可乐|炒/.test(source)) tags.push('下饭');
  return tags;
}

export function recipeMatchesDecisionFilter(recipe: Recipe, filter: DecisionFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'quick') return getRecipeCookTime(recipe) <= 20;
  const source = `${recipe.name} ${recipe.category} ${recipe.ingredients} ${recipe.notes} ${getRecipeTags(recipe).join(' ')}`;
  if (filter === 'light') return LIGHT_PATTERN.test(source) && !/红烧|糖醋|可乐|辣/.test(source);
  return MEAT_PATTERN.test(source);
}

export function pickRecommendation(
  recipes: Recipe[],
  currentId: number | undefined,
  filter: DecisionFilter,
  selectedIngredients: string[] = []
): Recipe | null {
  let candidates = recipes.filter(recipe => recipeMatchesDecisionFilter(recipe, filter));

  if (selectedIngredients.length) {
    candidates = candidates
      .map(recipe => ({ recipe, matches: getIngredientMatchCount(recipe, selectedIngredients) }))
      .filter(item => item.matches > 0)
      .sort((a, b) => b.matches - a.matches || (a.recipe.lastPickedAt ?? 0) - (b.recipe.lastPickedAt ?? 0))
      .map(item => item.recipe);
  }

  if (!candidates.length) return null;
  const alternatives = candidates.filter(recipe => recipe.id !== currentId);
  const pool = alternatives.length ? alternatives : candidates;
  const leastRecent = [...pool]
    .sort((a, b) => (a.lastPickedAt ?? 0) - (b.lastPickedAt ?? 0))
    .slice(0, Math.max(1, Math.ceil(pool.length / 2)));
  return leastRecent[Math.floor(Math.random() * leastRecent.length)];
}

export function getIngredientMatchCount(recipe: Recipe, selectedIngredients: string[]): number {
  const ingredients = parseRecipeList(recipe.ingredients).join(' ').toLowerCase();
  return selectedIngredients.filter(item => ingredients.includes(item.toLowerCase())).length;
}

export function getCoreIngredients(recipes: Recipe[]): string[] {
  const counts = new Map<string, number>();
  const suffixPattern = /\s*[0-9一二三四五六七八九十半适少]+.*$/;

  for (const recipe of recipes) {
    for (const ingredient of parseRecipeList(recipe.ingredients)) {
      const normalized = ingredient.replace(suffixPattern, '').trim().slice(0, 6);
      if (!normalized || normalized === '适量') continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name]) => name);
}

export function getPrimaryTag(recipe: Recipe): string {
  return getRecipeTags(recipe)[0] ?? recipe.category;
}
