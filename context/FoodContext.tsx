import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Food, FoodLog, Recommendation, NutritionSummary } from '../types';
import { mockFoods, mockFoodLogs } from '../data/mockData';
import { generateAIRecommendations } from '../utils/openAiUtils';

interface FoodContextType {
  foods: Food[];
  foodLogs: FoodLog[];
  recommendations: Recommendation[];
  addFood: (food: Omit<Food, 'id'>) => string;
  logFood: (foodId: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', quantity: number) => void;
  getFoodById: (id: string) => Food | undefined;
  getFoodsByDate: (date: Date) => Food[];
  getNutritionSummary: (date: Date) => NutritionSummary;
  refreshRecommendations: () => Promise<void>;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export const useFoodContext = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFoodContext must be used within a FoodProvider');
  }
  return context;
};

interface FoodProviderProps {
  children: ReactNode;
}

export const FoodProvider: React.FC<FoodProviderProps> = ({ children }) => {
  const [foods, setFoods] = useState<Food[]>(mockFoods);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(mockFoodLogs);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Generate initial recommendations
  useEffect(() => {
    refreshRecommendations();
  }, []);

  const addFood = (food: Omit<Food, 'id'>) => {
    const newFood: Food = {
      ...food,
      id: Date.now().toString(),
    };
    setFoods((prevFoods) => [...prevFoods, newFood]);
    return newFood.id;
  };

  const logFood = (foodId: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', quantity: number) => {
    const newFoodLog: FoodLog = {
      id: Date.now().toString(),
      foodId,
      date: new Date(),
      mealType,
      quantity,
    };
    setFoodLogs((prevLogs) => [...prevLogs, newFoodLog]);
    
    // Refresh recommendations after logging new food
    refreshRecommendations();
  };

  const getFoodById = (id: string) => {
    return foods.find((food) => food.id === id);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getFoodsByDate = (date: Date) => {
    const logsForDate = foodLogs.filter((log) => isSameDay(new Date(log.date), date));
    return logsForDate.map((log) => {
      const food = getFoodById(log.foodId);
      if (!food) return null;
      return {
        ...food,
        quantity: log.quantity,
        mealType: log.mealType,
      };
    }).filter(Boolean) as Food[];
  };

  const getNutritionSummary = (date: Date): NutritionSummary => {
    const foodsForDate = getFoodsByDate(date);
    
    return foodsForDate.reduce(
      (summary, food) => {
        const quantity = (food as any).quantity || 1;
        return {
          totalCalories: summary.totalCalories + food.calories * quantity,
          totalProtein: summary.totalProtein + food.protein * quantity,
          totalCarbs: summary.totalCarbs + food.carbs * quantity,
          totalFat: summary.totalFat + food.fat * quantity,
        };
      },
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );
  };

  const refreshRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      // Get today's foods
      const todayFoods = getFoodsByDate(new Date());
      
      // Generate AI-powered recommendations based on what's been eaten today
      const newRecommendations = await generateAIRecommendations(todayFoods);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      // If there's an error, we'll keep the existing recommendations
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  return (
    <FoodContext.Provider
      value={{
        foods,
        foodLogs,
        recommendations,
        addFood,
        logFood,
        getFoodById,
        getFoodsByDate,
        getNutritionSummary,
        refreshRecommendations,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};