import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SectionList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';
import { Food } from '../types';

type FoodDiaryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FoodDiaryScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getFoodsByDate, getNutritionSummary } = useFoodContext();
  const navigation = useNavigation<FoodDiaryScreenNavigationProp>();

  const foodsByDate = getFoodsByDate(selectedDate);
  const nutritionSummary = getNutritionSummary(selectedDate);

  // Group foods by meal type
  const groupedFoods = foodsByDate.reduce((acc, food) => {
    const mealType = food.mealType;
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(food);
    return acc;
  }, {} as Record<string, Food[]>);

  // Convert to format needed for SectionList
  const sections = Object.keys(groupedFoods).map(mealType => ({
    title: mealType.charAt(0).toUpperCase() + mealType.slice(1),
    data: groupedFoods[mealType],
  }));

  // Sort sections in logical meal order
  const mealOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
  sections.sort((a, b) => {
    return mealOrder[a.title.toLowerCase() as keyof typeof mealOrder] - 
           mealOrder[b.title.toLowerCase() as keyof typeof mealOrder];
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const navigateToAddFood = () => {
    // Changed from 'Camera' to 'CameraScreen'
    navigation.navigate('CameraScreen');
  };

  const navigateToFoodDetail = (foodId: string) => {
    navigation.navigate('FoodDetail', { foodId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Ionicons name="chevron-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.nutritionSummary}>
        <Text style={styles.summaryTitle}>Daily Summary</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutritionSummary.totalCalories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutritionSummary.totalProtein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutritionSummary.totalCarbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{nutritionSummary.totalFat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </View>

      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.foodItem}
              onPress={() => navigateToFoodDetail(item.id)}
            >
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.foodImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="restaurant" size={24} color="#aaa" />
                </View>
              )}
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCalories}>{item.calories} calories</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No foods logged for this day</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No foods logged for this day</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first meal</Text>
        </View>
      )}

      <TouchableOpacity style={styles.addButton} onPress={navigateToAddFood}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionSummary: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    padding: 15,
    color: '#333',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    contentFit: 'cover',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  foodCalories: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});