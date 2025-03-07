import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';
import { Ionicons } from '@expo/vector-icons';

type FoodDetailScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>;

export default function FoodDetailScreen() {
  const route = useRoute<FoodDetailScreenRouteProp>();
  const { foodId } = route.params;
  const { getFoodById } = useFoodContext();
  
  const food = getFoodById(foodId);

  if (!food) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Food not found</Text>
      </View>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {food.imageUri ? (
        <Image source={{ uri: food.imageUri }} style={styles.foodImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="restaurant" size={60} color="#ccc" />
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <Text style={styles.foodName}>{food.name}</Text>
        
        <View style={styles.mealTypeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.mealType}>
            {food.mealType.charAt(0).toUpperCase() + food.mealType.slice(1)}
          </Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666" style={styles.icon} />
          <Text style={styles.date}>{formatDate(food.timestamp)}</Text>
        </View>
        
        <View style={styles.nutritionCard}>
          <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <Text style={styles.nutritionValue}>{food.calories}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Protein</Text>
            <Text style={styles.nutritionValue}>{food.protein}g</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Carbohydrates</Text>
            <Text style={styles.nutritionValue}>{food.carbs}g</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Fat</Text>
            <Text style={styles.nutritionValue}>{food.fat}g</Text>
          </View>
        </View>
        
        <View style={styles.macroDistribution}>
          <Text style={styles.macroTitle}>Macro Distribution</Text>
          
          <View style={styles.macroChart}>
            <View 
              style={[
                styles.macroBar, 
                styles.proteinBar, 
                { flex: food.protein }
              ]} 
            />
            <View 
              style={[
                styles.macroBar, 
                styles.carbsBar, 
                { flex: food.carbs }
              ]} 
            />
            <View 
              style={[
                styles.macroBar, 
                styles.fatBar, 
                { flex: food.fat }
              ]} 
            />
          </View>
          
          <View style={styles.macroLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.proteinColor]} />
              <Text style={styles.legendText}>Protein</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.carbsColor]} />
              <Text style={styles.legendText}>Carbs</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.fatColor]} />
              <Text style={styles.legendText}>Fat</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  foodImage: {
    width: '100%',
    height: 250,
    contentFit: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  mealType: {
    fontSize: 16,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  icon: {
    marginRight: 5,
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
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#666',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  macroDistribution: {
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
  macroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  macroChart: {
    height: 30,
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  macroBar: {
    height: '100%',
  },
  proteinBar: {
    backgroundColor: '#4CAF50',
  },
  carbsBar: {
    backgroundColor: '#2196F3',
  },
  fatBar: {
    backgroundColor: '#FFC107',
  },
  macroLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  proteinColor: {
    backgroundColor: '#4CAF50',
  },
  carbsColor: {
    backgroundColor: '#2196F3',
  },
  fatColor: {
    backgroundColor: '#FFC107',
  },
  legendText: {
    fontSize: 14,
    color: '#666',
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
  },
});