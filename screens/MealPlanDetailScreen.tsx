import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';

type MealPlanDetailScreenRouteProp = RouteProp<RootStackParamList, 'MealPlanDetail'>;
type MealPlanDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MealPlanDetailScreen() {
  const route = useRoute<MealPlanDetailScreenRouteProp>();
  const navigation = useNavigation<MealPlanDetailScreenNavigationProp>();
  const { mealPlanId } = route.params;
  const { getSavedMealPlanById } = useFoodContext();
  
  const mealPlan = getSavedMealPlanById(mealPlanId);
  
  if (!mealPlan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Meal plan not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Format the date
  const formattedDate = new Date(mealPlan.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Format the time
  const formattedTime = new Date(mealPlan.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  
  const handleAddPhoto = () => {
    navigation.navigate('MealPlanCamera', { mealPlanId });
  };

  return (
    <ScrollView style={styles.container}>
      {mealPlan.photoUri ? (
        <Image
          source={{ uri: mealPlan.photoUri }}
          style={styles.mealImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="camera-outline" size={60} color="#ccc" />
          <TouchableOpacity 
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
          >
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <Text style={styles.mealPlanName}>{mealPlan.name}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={18} color="#666" style={styles.metaIcon} />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color="#666" style={styles.metaIcon} />
            <Text style={styles.metaText}>{formattedTime}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="restaurant-outline" size={18} color="#666" style={styles.metaIcon} />
            <Text style={styles.metaText}>
              {mealPlan.mealType.charAt(0).toUpperCase() + mealPlan.mealType.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.nutritionCard}>
          <Text style={styles.nutritionTitle}>Nutrition Summary</Text>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{mealPlan.nutritionSummary.totalCalories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{mealPlan.nutritionSummary.totalProtein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{mealPlan.nutritionSummary.totalCarbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{mealPlan.nutritionSummary.totalFat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.aiMessage}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.aiIcon} />
          <Text style={styles.aiMessageText}>{mealPlan.aiFeedback}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Meal Items</Text>
        
        {mealPlan.items.map((item, index) => (
          <View key={index} style={styles.foodItemCard}>
            <View style={styles.foodItemImageContainer}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.foodItemImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.foodItemPlaceholder}>
                  <Ionicons name="fast-food-outline" size={24} color="#ccc" />
                </View>
              )}
            </View>
            
            <View style={styles.foodItemDetails}>
              <Text style={styles.foodItemName}>{item.foodName}</Text>
              
              <View style={styles.foodItemNutrition}>
                <Text style={styles.foodItemNutritionText}>
                  {item.calories} cal · {item.protein}g protein · {item.carbs}g carbs · {item.fat}g fat
                </Text>
              </View>
            </View>
          </View>
        ))}
        
        {mealPlan.photoUri ? (
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleAddPhoto}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mealImage: {
    width: '100%',
    height: 250,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addPhotoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  mealPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
  },
  metaIcon: {
    marginRight: 5,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  nutritionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
  },
  aiMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
  },
  aiIcon: {
    marginRight: 10,
  },
  aiMessageText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  foodItemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  foodItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
  },
  foodItemImage: {
    width: '100%',
    height: '100%',
  },
  foodItemPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  foodItemNutrition: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  foodItemNutritionText: {
    fontSize: 14,
    color: '#666',
  },
  changePhotoButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  changePhotoText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});