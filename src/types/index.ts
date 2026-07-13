export interface Recipe {
  id: number;
  name: string;
  category: string;
  ingredients: string;
  steps: string;
  notes: string;
  imageUri: string;
  cookTime?: number;
  tags?: string;
  lastPickedAt?: number;
  pickCount?: number;
  createdAt: number;
  updatedAt: number;
}

export type DecisionFilter = 'all' | 'quick' | 'light' | 'meat';

export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  RecipeDetail: { recipeId: number };
  AddEditRecipe: { recipeId?: number };
  CookingMode: { recipeId: number };
  DecisionHistory: undefined;
};

export type TabParamList = {
  Home: undefined;
  RecipeList: undefined;
  AI: undefined;
  Settings: undefined;
};
