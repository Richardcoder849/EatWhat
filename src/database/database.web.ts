import { Recipe } from '../types';

const STORAGE_KEY = '@eatwhat:recipes';
let dbInitialized = false;

interface Row {
  id: number;
  name: string;
  category: string;
  ingredients: string;
  steps: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

function getData(): Row[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData(data: Row[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getDatabase(): Promise<{ web: boolean }> {
  if (!dbInitialized) {
    const data = getData();
    if (data.length === 0) {
      saveData([]);
    }
    dbInitialized = true;
  }
  return { web: true };
}

export async function closeDatabase(): Promise<void> {
  // no-op for web
}
