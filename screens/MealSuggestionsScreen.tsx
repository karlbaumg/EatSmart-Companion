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
  ImageBackground
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

type MealSuggestionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MealSuggestionsScreen() {
  const navigation = useNavigation<MealSuggestionsScreenNavigationProp>();
  const { recommendations, refreshRecommendations } = useFoodContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    refreshRecommendations();
    setCurrentIndex(0);
    setLoading(false);
  }, []);

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
    
    // Here you could save the user's preference
    // For example, if they swiped right (liked), you could save this meal as a favorite
    
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prevIndex => prevIndex + 1);
    
    // If we've gone through all recommendations, refresh or go back
    if (currentIndex >= recommendations.length - 1) {
      // Option 1: Go back to home
      // navigation.goBack();
      
      // Option 2: Refresh recommendations
      setLoading(true);
      refreshRecommendations();
      setCurrentIndex(0);
      setLoading(false);
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

  const renderNoMoreCards = () => {
    return (
      <View style={styles.noMoreCardsContainer}>
        <Ionicons name="restaurant-outline" size={80} color="#ccc" />
        <Text style={styles.noMoreCardsText}>No More Suggestions</Text>
        <Text style={styles.noMoreCardsSubtext}>We're refreshing your recommendations...</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            setLoading(true);
            refreshRecommendations();
            setCurrentIndex(0);
            setLoading(false);
          }}
        >
          <Text style={styles.refreshButtonText}>Refresh Suggestions</Text>
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
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.dislikeContainer, 
              { opacity: dislikeOpacity }
            ]}
          >
            <Text style={styles.dislikeText}>NOPE</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading meal suggestions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Suggestions</Text>
        <View style={styles.placeholder} />
      </View>

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
});