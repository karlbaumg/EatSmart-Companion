import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateRemainingCalories } from '../utils/openAiUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { getNutritionSummary } = useFoodContext();
  const [loading, setLoading] = useState(false);
  const [calorieInfo, setCalorieInfo] = useState({
    dailyCalorieGoal: 2000,
    remainingCalories: 2000,
    advice: "Balance your meals throughout the day for optimal nutrition."
  });
  
  // Get today's nutrition summary
  const todaysSummary = getNutritionSummary(new Date());

  // Calculate remaining calories when the component mounts or nutrition changes
  useEffect(() => {
    const fetchCalorieInfo = async () => {
      setLoading(true);
      try {
        const result = await calculateRemainingCalories(todaysSummary);
        setCalorieInfo(result);
      } catch (error) {
        console.error('Error calculating remaining calories:', error);
        // Set default values if there's an error
        setCalorieInfo({
          dailyCalorieGoal: 2000,
          remainingCalories: Math.max(0, 2000 - todaysSummary.totalCalories),
          advice: "Try to balance your remaining calories with a mix of protein, healthy fats, and complex carbohydrates."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCalorieInfo();
  }, [todaysSummary.totalCalories]);

  const navigateToCamera = () => {
    navigation.navigate('Camera');
  };

  const navigateToMealSuggestions = () => {
    navigation.navigate('MealSuggestions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What would you like to do?</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={navigateToCamera}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardBackground}
            imageStyle={styles.cardImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            >
              <View style={styles.cardContent}>
                <Ionicons name="camera" size={40} color="white" />
                <Text style={styles.cardTitle}>Log My Meal</Text>
                <Text style={styles.cardSubtitle}>Take a photo of what you're eating</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={navigateToMealSuggestions}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
            style={styles.cardBackground}
            imageStyle={styles.cardImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            >
              <View style={styles.cardContent}>
                <Ionicons name="restaurant" size={40} color="white" />
                <Text style={styles.cardTitle}>I'm Hungry</Text>
                <Text style={styles.cardSubtitle}>Get personalized meal suggestions</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </View>

      <View style={styles.calorieContainer}>
        <View style={styles.calorieHeader}>
          <Text style={styles.calorieTitle}>Calories Remaining</Text>
          {loading && <ActivityIndicator size="small" color="#4CAF50" style={styles.loader} />}
        </View>
        
        <View style={styles.calorieCalculation}>
          <View style={styles.calorieItem}>
            <Text style={styles.calorieValue}>{calorieInfo.dailyCalorieGoal}</Text>
            <Text style={styles.calorieLabel}>Goal</Text>
          </View>
          <Text style={styles.calculationSymbol}>-</Text>
          <View style={styles.calorieItem}>
            <Text style={styles.calorieValue}>{todaysSummary.totalCalories}</Text>
            <Text style={styles.calorieLabel}>Food</Text>
          </View>
          <Text style={styles.calculationSymbol}>=</Text>
          <View style={[styles.calorieItem, styles.remainingItem]}>
            <Text style={[styles.calorieValue, styles.remainingValue]}>{calorieInfo.remainingCalories}</Text>
            <Text style={styles.calorieLabel}>Remaining</Text>
          </View>
        </View>
        
        <View style={styles.adviceContainer}>
          <Ionicons name="bulb-outline" size={20} color="#4CAF50" style={styles.adviceIcon} />
          <Text style={styles.adviceText}>{calorieInfo.advice}</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Today's Nutrition</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{todaysSummary.totalCalories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{todaysSummary.totalProtein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{todaysSummary.totalCarbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{todaysSummary.totalFat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    height: 150,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    borderRadius: 15,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  calorieContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calorieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    marginLeft: 10,
  },
  calorieCalculation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  calorieItem: {
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  remainingItem: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  remainingValue: {
    color: '#4CAF50',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationSymbol: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  adviceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  adviceIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  adviceText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
  },
});