import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';

type MealPlanCameraScreenRouteProp = RouteProp<RootStackParamList, 'MealPlanCamera'>;
type MealPlanCameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MealPlanCameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const route = useRoute<MealPlanCameraScreenRouteProp>();
  const navigation = useNavigation<MealPlanCameraScreenNavigationProp>();
  const { mealPlanId } = route.params;
  const { updateMealPlanPhoto } = useFoodContext();
  
  const cameraRef = useRef<Camera>(null);

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
    }
  };

  const saveImage = () => {
    if (capturedImage) {
      try {
        // Update the meal plan with the photo
        updateMealPlanPhoto(mealPlanId, capturedImage);
        
        // Navigate back to the meal plan detail
        navigation.navigate('MealPlanDetail', { mealPlanId });
        
        // Show success message
        Alert.alert('Success', 'Photo added to meal plan!');
      } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('Error', 'Failed to save photo. Please try again.');
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
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
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Take a photo of your meal</Text>
          </View>
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
          
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Ionicons name="refresh-outline" size={24} color="#666" />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.saveButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
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
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#333',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  retakeButtonText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});