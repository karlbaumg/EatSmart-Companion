import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFoodContext } from '../context/FoodContext';

export default function RecommendationScreen() {
  const { recommendations, refreshRecommendations } = useFoodContext();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshRecommendations();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What Should I Eat?</Text>
        <Text style={styles.subtitle}>
          AI-powered recommendations based on your eating habits
        </Text>
      </View>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recommendationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.foodName}>{item.foodName}</Text>
              <View style={styles.caloriesBadge}>
                <Text style={styles.caloriesText}>{item.calories} cal</Text>
              </View>
            </View>
            
            {item.imageUri && (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.foodImage}
                contentFit="cover"
              />
            )}
            
            <View style={styles.reasonContainer}>
              <Ionicons name="bulb-outline" size={20} color="#4CAF50" style={styles.reasonIcon} />
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
            
            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="nutrition-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No recommendations available</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 15,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  caloriesBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  caloriesText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  foodImage: {
    width: '100%',
    height: 200,
  },
  reasonContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f9f9f9',
    alignItems: 'flex-start',
  },
  reasonIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  nutritionContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});