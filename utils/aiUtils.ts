import { Food, Recommendation } from '../types';

// This is a mock function that simulates AI-based recommendations
// In a real app, this would call an AI service or API
export function generateRecommendations(todayFoods: Food[]): Recommendation[] {
  // Calculate total nutrients consumed today
  const totalNutrients = todayFoods.reduce(
    (acc, food) => {
      const quantity = (food as any).quantity || 1;
      return {
        calories: acc.calories + food.calories * quantity,
        protein: acc.protein + food.protein * quantity,
        carbs: acc.carbs + food.carbs * quantity,
        fat: acc.fat + food.fat * quantity,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Define target daily nutrients (these would be personalized in a real app)
  const targetNutrients = {
    calories: 2000,
    protein: 100,
    carbs: 250,
    fat: 70,
  };

  // Calculate remaining nutrients needed
  const remainingNutrients = {
    calories: Math.max(0, targetNutrients.calories - totalNutrients.calories),
    protein: Math.max(0, targetNutrients.protein - totalNutrients.protein),
    carbs: Math.max(0, targetNutrients.carbs - totalNutrients.carbs),
    fat: Math.max(0, targetNutrients.fat - totalNutrients.fat),
  };

  // Mock recommendations based on remaining nutrients
  const recommendations: Recommendation[] = [];

  // Check if we need more protein
  if (remainingNutrients.protein > 30) {
    recommendations.push({
      id: '1',
      foodName: 'Grilled Chicken Breast',
      reason: 'You need more protein today. This will help you reach your protein goal.',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      imageUri: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    });
  }

  // Check if we need more carbs
  if (remainingNutrients.carbs > 50) {
    recommendations.push({
      id: '2',
      foodName: 'Brown Rice Bowl',
      reason: 'You need more complex carbohydrates. This will provide sustained energy.',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      imageUri: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    });
  }

  // Check if we need more healthy fats
  if (remainingNutrients.fat > 20) {
    recommendations.push({
      id: '3',
      foodName: 'Avocado Salad',
      reason: 'You need more healthy fats. Avocados provide heart-healthy monounsaturated fats.',
      calories: 234,
      protein: 3,
      carbs: 12,
      fat: 21,
      imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    });
  }

  // If we're low on calories overall
  if (remainingNutrients.calories > 500) {
    recommendations.push({
      id: '4',
      foodName: 'Balanced Meal Plate',
      reason: 'You still need more calories today. This balanced meal will help you reach your goals.',
      calories: 450,
      protein: 25,
      carbs: 45,
      fat: 15,
      imageUri: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    });
  }

  // If we've met most of our nutrient goals
  if (
    remainingNutrients.calories < 300 &&
    remainingNutrients.protein < 15 &&
    remainingNutrients.carbs < 30 &&
    remainingNutrients.fat < 10
  ) {
    recommendations.push({
      id: '5',
      foodName: 'Fresh Fruit Salad',
      reason: "You've met most of your nutrient goals! This light option will complete your day.",
      calories: 100,
      protein: 1,
      carbs: 25,
      fat: 0,
      imageUri: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    });
  }

  // Always ensure we have at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      id: '6',
      foodName: 'Vegetable Soup',
      reason: 'A light, nutritious option that fits into most diet plans.',
      calories: 120,
      protein: 5,
      carbs: 20,
      fat: 2,
      imageUri: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    });
  }

  return recommendations;
}

// This function would analyze a food image and return nutrition information
// In a real app, this would call a computer vision API or ML model
export function analyzeFoodImage(imageUri: string): Promise<Partial<Food>> {
  // This is a mock implementation
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Return mock data
      resolve({
        name: 'Detected Food Item',
        calories: Math.floor(Math.random() * 300) + 200,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 30) + 10,
        fat: Math.floor(Math.random() * 15) + 5,
        imageUri,
      });
    }, 1500);
  });
}