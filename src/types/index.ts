export interface Recipe {
  id: number;
  name: string;
  category: string;
  ingredients: string;
  steps: string;
  notes: string;
  imageUri: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  RecipeDetail: { recipeId: number };
  AddEditRecipe: { recipeId?: number };
};

export type TabParamList = {
  Home: undefined;
  RecipeList: undefined;
  AI: undefined;
  Settings: undefined;
};
