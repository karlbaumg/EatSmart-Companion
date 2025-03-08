export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUri?: string;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface FoodLog {
  id: string;
  foodId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
}

export interface Recommendation {
  id: string;
  foodName: string;
  reason: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUri?: string;
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealPlanItem {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUri?: string;
}

export interface SavedMealPlan {
  id: string;
  name: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealPlanItem[];
  photoUri?: string;
  aiFeedback: string;
  nutritionSummary: NutritionSummary;
}