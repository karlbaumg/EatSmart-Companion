import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';
import { analyzeFoodImage } from '../utils/aiUtils';
import { Food } from '../types';

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedFood, setDetectedFood] = useState<Partial<Food> | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  
  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { addFood, logFood } = useFoodContext();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        analyzeImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCapturedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      const foodData = await analyzeFoodImage(imageUri);
      setDetectedFood(foodData);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze the food image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveFood = () => {
    if (detectedFood) {
      try {
        // Add the food to our database
        const foodId = addFood({
          name: detectedFood.name || 'Unknown Food',
          calories: detectedFood.calories || 0,
          protein: detectedFood.protein || 0,
          carbs: detectedFood.carbs || 0,
          fat: detectedFood.fat || 0,
          imageUri: capturedImage || undefined,
          timestamp: new Date(),
          mealType: selectedMealType,
        });
        
        // Log that we ate this food
        logFood(foodId, selectedMealType, 1);
        
        // Reset the state
        setCapturedImage(null);
        setDetectedFood(null);
        
        // Navigate back to the diary
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Main');
        }
        
        // Show success message
        Alert.alert('Success', 'Food logged successfully!');
      } catch (error) {
        console.error('Error saving food:', error);
        Alert.alert('Error', 'Failed to save food. Please try again.');
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setDetectedFood(null);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick an image from gallery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <>
          <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => {
                  setType(type === CameraType.back ? CameraType.front : CameraType.back);
                }}>
                <Ionicons name="sync-outline" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </Camera>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Ionicons name="camera" size={36} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={30} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.analyzingText}>Analyzing your food...</Text>
            </View>
          ) : detectedFood ? (
            <View style={styles.detectedFoodContainer}>
              <Text style={styles.detectedFoodTitle}>{detectedFood.name}</Text>
              <View style={styles.nutritionInfo}>
                <Text style={styles.nutritionText}>Calories: {detectedFood.calories}</Text>
                <Text style={styles.nutritionText}>Protein: {detectedFood.protein}g</Text>
                <Text style={styles.nutritionText}>Carbs: {detectedFood.carbs}g</Text>
                <Text style={styles.nutritionText}>Fat: {detectedFood.fat}g</Text>
              </View>
              
              <Text style={styles.mealTypeLabel}>Meal Type:</Text>
              <View style={styles.mealTypeContainer}>
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
                  <TouchableOpacity
                    key={meal}
                    style={[
                      styles.mealTypeButton,
                      selectedMealType === meal && styles.selectedMealType,
                    ]}
                    onPress={() => setSelectedMealType(meal)}
                  >
                    <Text 
                      style={[
                        styles.mealTypeText,
                        selectedMealType === meal && styles.selectedMealTypeText,
                      ]}
                    >
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={saveFood}>
                  <Text style={styles.saveButtonText}>Save Food</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.retakeButton} onPress={resetCamera}>
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to analyze the image.</Text>
              <TouchableOpacity style={styles.retakeButton} onPress={resetCamera}>
                <Text style={styles.retakeButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
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
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 20,
  },
  flipButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#333',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 15,
    marginHorizontal: 20,
  },
  galleryButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 15,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    contentFit: 'cover',
  },
  analyzingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  analyzingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  detectedFoodContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detectedFoodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  nutritionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  nutritionText: {
    fontSize: 16,
    marginRight: 15,
    marginBottom: 5,
    color: '#666',
  },
  mealTypeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mealTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  selectedMealType: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mealTypeText: {
    color: '#666',
  },
  selectedMealTypeText: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retakeButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});