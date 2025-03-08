import { Food, Recommendation } from '../types';

// Function to call OpenAI API
export async function callOpenAI(prompt: string): Promise<any> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key is not defined');
      throw new Error('OpenAI API key is not defined');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a nutritionist AI assistant that helps users make healthy food choices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

// Generate food recommendations based on what the user has eaten today
export async function generateAIRecommendations(todayFoods: Food[]): Promise<Recommendation[]> {
  try {
    // Create a prompt that describes what the user has eaten today
    let prompt = `I need food recommendations based on what I've eaten today. Here's what I've had so far:\n\n`;
    
    if (todayFoods.length === 0) {
      prompt += "I haven't eaten anything yet today.\n\n";
    } else {
      todayFoods.forEach(food => {
        prompt += `- ${food.name}: ${food.calories} calories, ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat (${food.mealType})\n`;
      });
    }
    
    prompt += `\nBased on this, suggest 5 individual food items that would be good for my next meal. For each item, provide:
    1. The name of the food
    2. Estimated calories, protein, carbs, and fat
    3. A brief reason why this would be a good choice
    
    Format your response as a JSON array with objects containing: foodName, calories, protein, carbs, fat, reason.`;

    // Call OpenAI API
    const response = await callOpenAI(prompt);
    
    // Parse the JSON response
    let recommendations: Recommendation[] = [];
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = JSON.parse(response);
      }
      
      // Add IDs to recommendations
      recommendations = recommendations.map((rec, index) => ({
        ...rec,
        id: `ai-rec-${Date.now()}-${index}`,
        // Add default image URLs based on food name
        imageUri: `https://source.unsplash.com/featured/?${encodeURIComponent(rec.foodName)},food`
      }));
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw response:', response);
      // Fallback to default recommendations
      return getDefaultRecommendations();
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    // Fallback to default recommendations if the API call fails
    return getDefaultRecommendations();
  }
}

// Check if a meal is complete based on selected items
export async function checkIfMealIsComplete(selectedItems: any[]): Promise<{ isComplete: boolean; feedback: string }> {
  if (selectedItems.length === 0) {
    return { isComplete: false, feedback: "You haven't selected any items yet." };
  }
  
  try {
    // Create a prompt that describes the selected items
    let prompt = `I'm planning a meal with the following items:\n\n`;
    
    selectedItems.forEach(item => {
      prompt += `- ${item.foodName}: ${item.calories} calories, ${item.protein}g protein, ${item.carbs}g carbs, ${item.fat}g fat\n`;
    });
    
    prompt += `\nBased on these selected items:
    1. Is this a complete, balanced meal? 
    2. If not, what's missing?
    3. If yes, explain why it's balanced.
    
    Format your response as a JSON object with: isComplete (boolean), feedback (string with your explanation).`;

    // Call OpenAI API
    const response = await callOpenAI(prompt);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return JSON.parse(response);
      }
    } catch (error) {
      console.error('Error parsing OpenAI response for meal completeness:', error);
      console.log('Raw response:', response);
      
      // Fallback to simple heuristic
      return fallbackMealCompletenessCheck(selectedItems);
    }
  } catch (error) {
    console.error('Error checking if meal is complete:', error);
    // Fallback to simple heuristic if the API call fails
    return fallbackMealCompletenessCheck(selectedItems);
  }
}

// Fallback function to check meal completeness without AI
function fallbackMealCompletenessCheck(selectedItems: any[]): { isComplete: boolean; feedback: string } {
  // Calculate total nutrients
  const totalNutrients = selectedItems.reduce(
    (acc, item) => {
      return {
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  // Check if the meal has a good balance of nutrients
  const hasEnoughCalories = totalNutrients.calories >= 500;
  const hasEnoughProtein = totalNutrients.protein >= 20;
  const hasEnoughCarbs = totalNutrients.carbs >= 40;
  const hasEnoughFat = totalNutrients.fat >= 15;
  
  // If the meal has enough of each nutrient, or if the user has selected 5 items, mark as complete
  const isComplete = (hasEnoughCalories && hasEnoughProtein && hasEnoughCarbs && hasEnoughFat) || selectedItems.length >= 5;
  
  let feedback = '';
  if (isComplete) {
    feedback = "This meal plan is balanced and meets your nutritional needs!";
  } else {
    feedback = "Your meal plan needs more items to be nutritionally complete.";
    if (!hasEnoughCalories) feedback += " Consider adding more calories.";
    if (!hasEnoughProtein) feedback += " You need more protein.";
    if (!hasEnoughCarbs) feedback += " Add some more carbohydrates.";
    if (!hasEnoughFat) feedback += " Include some healthy fats.";
  }
  
  return { isComplete, feedback };
}

// Default recommendations as fallback
function getDefaultRecommendations(): Recommendation[] {
  return [
    {
      id: '1',
      foodName: 'Grilled Chicken Breast',
      reason: 'High in protein and low in fat, perfect for muscle recovery.',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      imageUri: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '2',
      foodName: 'Brown Rice Bowl',
      reason: 'Complex carbohydrates provide sustained energy throughout the day.',
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      imageUri: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '3',
      foodName: 'Avocado Salad',
      reason: 'Rich in healthy fats and fiber to keep you feeling full longer.',
      calories: 234,
      protein: 3,
      carbs: 12,
      fat: 21,
      imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '4',
      foodName: 'Salmon Fillet',
      reason: 'Excellent source of omega-3 fatty acids and high-quality protein.',
      calories: 367,
      protein: 40,
      carbs: 0,
      fat: 22,
      imageUri: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '5',
      foodName: 'Greek Yogurt with Berries',
      reason: 'Probiotics for gut health plus antioxidants from the berries.',
      calories: 150,
      protein: 15,
      carbs: 20,
      fat: 0.5,
      imageUri: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ];
}