// Update the handleSaveMealPlan function in MealSuggestionsScreen.tsx

const handleSaveMealPlan = () => {
  // Create a name for the meal plan based on the meal type and date
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  // Default name based on time of day
  let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack';
  const hour = now.getHours();
  
  if (hour >= 5 && hour < 11) {
    mealType = 'breakfast';
  } else if (hour >= 11 && hour < 15) {
    mealType = 'lunch';
  } else if (hour >= 15 && hour < 22) {
    mealType = 'dinner';
  }
  
  const mealPlanName = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} - ${dateString} ${timeString}`;
  
  // Convert selected items to meal plan items
  const mealPlanItems = selectedItems.map(item => ({
    id: item.id,
    foodName: item.foodName,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    imageUri: item.imageUri
  }));
  
  // Save the meal plan
  const mealPlanId = saveMealPlan(mealPlanName, mealType, mealPlanItems, undefined, aiFeedback);
  
  // Close the modal
  setShowMealPlan(false);
  
  // Ask if the user wants to take a photo of their meal
  Alert.alert(
    "Meal Plan Saved",
    "Would you like to take a photo of this meal?",
    [
      {
        text: "Not Now",
        style: "cancel",
        onPress: () => navigation.navigate('SavedMealPlans')
      },
      {
        text: "Take Photo",
        onPress: () => navigation.navigate('MealPlanCamera', { mealPlanId })
      }
    ]
  );
};