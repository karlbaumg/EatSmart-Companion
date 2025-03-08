import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';
import { SavedMealPlan } from '../types';

type SavedMealPlansScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavedMealPlansScreen() {
  const navigation = useNavigation<SavedMealPlansScreenNavigationProp>();
  const { savedMealPlans } = useFoodContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, you might fetch the latest meal plans from a server here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const navigateToMealPlanDetail = (mealPlanId: string) => {
    navigation.navigate('MealPlanDetail', { mealPlanId });
  };

  const renderMealPlanCard = ({ item }: { item: SavedMealPlan }) => {
    // Get a representative image for the meal plan
    const mealImage = item.photoUri || item.items[0]?.imageUri;
    
    // Format the date
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    // Format the time
    const formattedTime = new Date(item.date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity 
        style={styles.mealPlanCard}
        onPress={() => navigateToMealPlanDetail(item.id)}
      >
        <View style={styles.mealPlanImageContainer}>
          {mealImage ? (
            <Image
              source={{ uri: mealImage }}
              style={styles.mealPlanImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="restaurant-outline" size={40} color="#ccc" />
            </View>
          )}
        </View>
        
        <View style={styles.mealPlanInfo}>
          <Text style={styles.mealPlanName}>{item.name}</Text>
          
          <View style={styles.mealPlanMeta}>
            <View style={styles.mealPlanMetaItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" style={styles.metaIcon} />
              <Text style={styles.mealPlanMetaText}>{formattedDate}</Text>
            </View>
            
            <View style={styles.mealPlanMetaItem}>
              <Ionicons name="time-outline" size={16} color="#666" style={styles.metaIcon} />
              <Text style={styles.mealPlanMetaText}>{formattedTime}</Text>
            </View>
          </View>
          
          <View style={styles.nutritionSummary}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutritionSummary.totalCalories}</Text>
              <Text style={styles.nutritionLabel}>cal</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutritionSummary.totalProtein}g</Text>
              <Text style={styles.nutritionLabel}>protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutritionSummary.totalCarbs}g</Text>
              <Text style={styles.nutritionLabel}>carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{item.nutritionSummary.totalFat}g</Text>
              <Text style={styles.nutritionLabel}>fat</Text>
            </View>
          </View>
          
          <View style={styles.itemsPreview}>
            {item.items.slice(0, 3).map((foodItem, index) => (
              <Text key={index} style={styles.itemPreviewText} numberOfLines={1} ellipsizeMode="tail">
                • {foodItem.foodName}
              </Text>
            ))}
            {item.items.length > 3 && (
              <Text style={styles.moreItemsText}>+{item.items.length - 3} more items</Text>
            )}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Meal Plans</Text>
      </View>

      {savedMealPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No Saved Meal Plans</Text>
          <Text style={styles.emptySubtext}>
            Your saved meal plans will appear here. Start by creating a meal plan in the "I'm Hungry" section.
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('MealSuggestions')}
          >
            <Text style={styles.createButtonText}>Create Meal Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedMealPlans}
          renderItem={renderMealPlanCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        />
      )}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 15,
  },
  mealPlanCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealPlanImageContainer: {
    width: 100,
    height: 'auto',
  },
  mealPlanImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealPlanInfo: {
    flex: 1,
    padding: 15,
  },
  mealPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mealPlanMeta: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mealPlanMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaIcon: {
    marginRight: 5,
  },
  mealPlanMetaText: {
    fontSize: 14,
    color: '#666',
  },
  nutritionSummary: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nutritionItem: {
    marginRight: 15,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  itemsPreview: {
    marginTop: 5,
  },
  itemPreviewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  chevron: {
    alignSelf: 'center',
    marginRight: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});