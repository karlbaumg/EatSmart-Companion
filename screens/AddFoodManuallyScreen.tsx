import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useFoodContext } from '../context/FoodContext';

type AddFoodManuallyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AddFoodManuallyScreen() {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  
  const navigation = useNavigation<AddFoodManuallyScreenNavigationProp>();
  const { addFood, logFood } = useFoodContext();

  const validateInputs = () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return false;
    }
    
    if (!calories || isNaN(Number(calories)) || Number(calories) < 0) {
      Alert.alert('Error', 'Please enter a valid calorie amount');
      return false;
    }
    
    if (!protein || isNaN(Number(protein)) || Number(protein) < 0) {
      Alert.alert('Error', 'Please enter a valid protein amount');
      return false;
    }
    
    if (!carbs || isNaN(Number(carbs)) || Number(carbs) < 0) {
      Alert.alert('Error', 'Please enter a valid carbs amount');
      return false;
    }
    
    if (!fat || isNaN(Number(fat)) || Number(fat) < 0) {
      Alert.alert('Error', 'Please enter a valid fat amount');
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (!validateInputs()) return;
    
    try {
      // Add the food to our database
      const foodId = addFood({
        name: foodName,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        timestamp: new Date(),
        mealType: selectedMealType,
      });
      
      // Log that we ate this food
      logFood(foodId, selectedMealType, 1);
      
      // Navigate back to the diary
      navigation.navigate('Main');
      
      // Show success message
      Alert.alert('Success', 'Food added successfully!');
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert('Error', 'Failed to save food. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Food Name</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="Enter food name"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Calories</Text>
          <TextInput
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            placeholder="Enter calories"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.macroContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              value={protein}
              onChangeText={setProtein}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              value={carbs}
              onChangeText={setCarbs}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              value={fat}
              onChangeText={setFat}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Meal Type</Text>
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
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Food</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    minWidth: '48%',
    alignItems: 'center',
  },
  selectedMealType: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mealTypeText: {
    color: '#666',
    fontSize: 14,
  },
  selectedMealTypeText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});