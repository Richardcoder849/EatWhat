import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_STORAGE_KEY = '@eatwhat/today-menu';

interface StoredMenu {
  date: string;
  recipeIds: number[];
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(id => Number.isInteger(id) && id > 0) as number[])];
}

async function saveMenu(recipeIds: number[]) {
  const menu: StoredMenu = { date: getLocalDateKey(), recipeIds: normalizeIds(recipeIds) };
  await AsyncStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
  return menu.recipeIds;
}

export async function getMenuRecipeIds() {
  const raw = await AsyncStorage.getItem(MENU_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Partial<StoredMenu>;
    if (parsed.date !== getLocalDateKey()) return saveMenu([]);
    return normalizeIds(parsed.recipeIds);
  } catch {
    return saveMenu([]);
  }
}

export async function addRecipeToMenu(recipeId: number) {
  const current = await getMenuRecipeIds();
  return saveMenu([...current, recipeId]);
}

export async function removeRecipeFromMenu(recipeId: number) {
  const current = await getMenuRecipeIds();
  return saveMenu(current.filter(id => id !== recipeId));
}

export async function clearTodayMenu() {
  return saveMenu([]);
}
