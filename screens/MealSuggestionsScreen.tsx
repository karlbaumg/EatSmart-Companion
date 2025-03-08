import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';
import { LinearGradient } from 'expo-linear-gradient';
import { checkIfMealIsComplete } from '../utils/openAiUtils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

type MealSuggestionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MealSuggestionsScreen() {
  const navigation = useNavigation<MealSuggestionsScreenNavigationProp>();
  const { recommendations, refreshRecommendations } = useFoodContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [mealComplete, setMealComplete] = useState(false);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("Your meal plan is being analyzed...");
  const [checkingMeal, setCheckingMeal] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.5, 1],
    extrapolate: 'clamp'
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.9, 1],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshRecommendations();
      } catch (error) {
        console.error('Error loading recommendations:', error);
        Alert.alert('Error', 'Failed to load food recommendations. Please try again.');
      } finally {
        setCurrentIndex(0);
        setSelectedItems([]);
        setMealComplete(false);
        setShowMealPlan(false);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Check if the meal is complete after each selection
  useEffect(() => {
    if (selectedItems.length > 0) {
      checkMealCompleteness();
    }
  }, [selectedItems]);

  const checkMealCompleteness = async () => {
    // Only check if we have at least 2 items
    if (selectedItems.length < 2) return;
    
    setCheckingMeal(true);
    try {
      // Use OpenAI to check if the meal is complete
      const result = await checkIfMealIsComplete(selectedItems);
      setAiFeedback(result.feedback);
      
      if (result.isComplete) {
        setMealComplete(true);
        setShowMealPlan(true);
      }
    } catch (error) {
      console.error('Error checking meal completeness:', error);
      // Fallback to simple check if AI fails
      if (selectedItems.length >= 5) {
        setMealComplete(true);
        setAiFeedback("This meal plan contains a good variety of foods!");
        setShowMealPlan(true);
      }
    } finally {
      setCheckingMeal(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = recommendations[currentIndex];
    
    // If swiped right (liked), add to selected items
    if (direction === 'right') {
      setSelectedItems(prev => [...prev, item]);
    }
    
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prevIndex => prevIndex + 1);
    
    // If we've gone through all recommendations, refresh
    if (currentIndex >= recommendations.length - 1) {
      setLoading(true);
      refreshRecommendations()
        .then(() => {
          setCurrentIndex(0);
        })
        .catch(error => {
          console.error('Error refreshing recommendations:', error);
          Alert.alert('Error', 'Failed to load more food options. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false
    }).start();
  };

  const handleLikePress = () => {
    forceSwipe('right');
  };

  const handleDislikePress = () => {
    forceSwipe('left');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCloseMealPlan = () => {
    setShowMealPlan(false);
  };

  const handleStartOver = () => {
    setSelectedItems([]);
    setMealComplete(false);
    setCurrentIndex(0);
    setShowMealPlan(false);
  };

  const handleSaveMealPlan = () => {
    // Here you would save the meal plan to the user's history
    // For now, we'll just go back to the home screen
    setShowMealPlan(false);
    navigation.goBack();
  };

  const renderNoMoreCards = () => {
    return (
      <View style={styles.noMoreCardsContainer}>
        <Ionicons name="restaurant-outline" size={80} color="#ccc" />
        <Text style={styles.noMoreCardsText}>No More Food Items</Text>
        <Text style={styles.noMoreCardsSubtext}>We're refreshing your options...</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            setLoading(true);
            refreshRecommendations()
              .then(() => {
                setCurrentIndex(0);
              })
              .catch(error => {
                console.error('Error refreshing recommendations:', error);
                Alert.alert('Error', 'Failed to refresh food options. Please try again.');
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          <Text style={styles.refreshButtonText}>Refresh Options</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCard = (item: any, index: number) => {
    if (index < currentIndex) return null;

    if (index === currentIndex) {
      return (
        <Animated.View
          key={item.id}
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX: position.x },
                { rotate: rotation }
              ],
              zIndex: 1
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.card}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.cardImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="fast-food-outline" size={60} color="#ccc" />
              </View>
            )}
            
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.foodName}</Text>
              
              <View style={styles.nutritionContainer}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{item.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
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
              
              <View style={styles.reasonContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#4CAF50" style={styles.reasonIcon} />
                <Text style={styles.reasonText}>{item.reason}</Text>
              </View>
            </View>
          </View>

          <Animated.View 
            style={[
              styles.likeContainer, 
              { opacity: likeOpacity }
            ]}
          >
            <Text style={styles.likeText}>ADD</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.dislikeContainer, 
              { opacity: dislikeOpacity }
            ]}
          >
            <Text style={styles.dislikeText}>SKIP</Text>
          </Animated.View>
        </Animated.View>
      );
    }

    if (index === currentIndex + 1) {
      return (
        <Animated.View
          key={item.id}
          style={[
            styles.cardContainer,
            {
              opacity: nextCardOpacity,
              transform: [{ scale: nextCardScale }],
              zIndex: 0
            }
          ]}
        >
          <View style={styles.card}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.cardImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="fast-food-outline" size={60} color="#ccc" />
              </View>
            )}
            
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.foodName}</Text>
              
              <View style={styles.nutritionContainer}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{item.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
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
              
              <View style={styles.reasonContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#4CAF50" style={styles.reasonIcon} />
                <Text style={styles.reasonText}>{item.reason}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      );
    }

    return null;
  };

  const renderMealPlanModal = () => {
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

    return (
      <Modal
        visible={showMealPlan}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseMealPlan}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Meal Plan</Text>
              <TouchableOpacity onPress={handleCloseMealPlan}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.mealSummary}>
              <Text style={styles.mealSummaryTitle}>Nutrition Summary</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionSummaryItem}>
                  <Text style={styles.nutritionSummaryValue}>{totalNutrients.calories}</Text>
                  <Text style={styles.nutritionSummaryLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionSummaryItem}>
                  <Text style={styles.nutritionSummaryValue}>{totalNutrients.protein}g</Text>
                  <Text style={styles.nutritionSummaryLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionSummaryItem}>
                  <Text style={styles.nutritionSummaryValue}>{totalNutrients.carbs}g</Text>
                  <Text style={styles.nutritionSummaryLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionSummaryItem}>
                  <Text style={styles.nutritionSummaryValue}>{totalNutrients.fat}g</Text>
                  <Text style={styles.nutritionSummaryLabel}>Fat</Text>
                </View>
              </View>
            </View>

            <Text style={styles.selectedItemsTitle}>Selected Items</Text>
            <ScrollView style={styles.selectedItemsList}>
              {selectedItems.map((item, index) => (
                <View key={index} style={styles.selectedItemCard}>
                  <View style={styles.selectedItemImageContainer}>
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.selectedItemImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.selectedItemPlaceholder}>
                        <Ionicons name="fast-food-outline" size={24} color="#ccc" />
                      </View>
                    )}
                  </View>
                  <View style={styles.selectedItemDetails}>
                    <Text style={styles.selectedItemName}>{item.foodName}</Text>
                    <Text style={styles.selectedItemNutrition}>
                      {item.calories} cal · {item.protein}g protein · {item.carbs}g carbs · {item.fat}g fat
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.aiMessage}>
              {checkingMeal ? (
                <View style={styles.aiAnalyzing}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={styles.aiMessageText}>Analyzing your meal plan...</Text>
                </View>
              ) : (
                <>
                  <Ionicons 
                    name={mealComplete ? "checkmark-circle" : "information-circle"} 
                    size={24} 
                    color={mealComplete ? "#4CAF50" : "#FF9800"} 
                    style={styles.aiIcon} 
                  />
                  <Text style={styles.aiMessageText}>
                    {aiFeedback}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.startOverButton} onPress={handleStartOver}>
                <Text style={styles.startOverButtonText}>Start Over</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.savePlanButton,
                  !mealComplete && styles.savePlanButtonDisabled
                ]} 
                onPress={handleSaveMealPlan}
                disabled={!mealComplete}
              >
                <Text style={styles.savePlanButtonText}>Save Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSelectedItemsPreview = () => {
    if (selectedItems.length === 0) return null;

    return (
      <View style={styles.selectedItemsPreview}>
        <Text style={styles.selectedItemsCount}>
          {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
        </Text>
        <View style={styles.selectedItemsImages}>
          {selectedItems.slice(0, 3).map((item, index) => (
            <View key={index} style={[styles.selectedItemPreviewImage, { zIndex: 3 - index, marginLeft: index > 0 ? -15 : 0 }]}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.previewImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.previewPlaceholder}>
                  <Ionicons name="fast-food-outline" size={16} color="#aaa" />
                </View>
              )}
            </View>
          ))}
          {selectedItems.length > 3 && (
            <View style={[styles.selectedItemPreviewImage, styles.moreItemsIndicator, { marginLeft: -15 }]}>
              <Text style={styles.moreItemsText}>+{selectedItems.length - 3}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.viewPlanButton} 
          onPress={() => setShowMealPlan(true)}
        >
          <Text style={styles.viewPlanButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading food options...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Build Your Meal</Text>
        <View style={styles.placeholder} />
      </View>

      {renderSelectedItemsPreview()}

      <View style={styles.cardsContainer}>
        {recommendations.length > currentIndex ? (
          recommendations.map((item, index) => renderCard(item, index)).reverse()
        ) : (
          renderNoMoreCards()
        )}
      </View>

      {recommendations.length > currentIndex && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.dislikeButton} onPress={handleDislikePress}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={handleLikePress}>
            <Ionicons name="checkmark" size={30} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {renderMealPlanModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 38, // Same width as the back button for balance
  },
  selectedItemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItemsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedItemsImages: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  selectedItemPreviewImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsIndicator: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewPlanButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  viewPlanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    height: '50%',
    width: '100%',
  },
  placeholderImage: {
    height: '50%',
    width: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reasonIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  reasonText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    lineHeight: 22,
  },
  likeContainer: {
    position: 'absolute',
    top: 50,
    right: 40,
    transform: [{ rotate: '15deg' }],
    borderWidth: 4,
    borderRadius: 5,
    borderColor: '#4CAF50',
    padding: 10,
  },
  likeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dislikeContainer: {
    position: 'absolute',
    top: 50,
    left: 40,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 4,
    borderRadius: 5,
    borderColor: '#FF6B6B',
    padding: 10,
  },
  dislikeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dislikeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  noMoreCardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noMoreCardsSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
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
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  mealSummary: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  mealSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionSummaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionSummaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  selectedItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  selectedItemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  selectedItemCard: {
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
  selectedItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 15,
  },
  selectedItemImage: {
    width: '100%',
    height: '100%',
  },
  selectedItemPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedItemNutrition: {
    fontSize: 14,
    color: '#666',
  },
  aiMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 10,
  },
  aiAnalyzing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    marginRight: 10,
  },
  aiMessageText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  startOverButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  startOverButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savePlanButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  savePlanButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  savePlanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});