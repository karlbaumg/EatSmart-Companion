import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CameraScreen from '../screens/CameraScreen';
import FoodDiaryScreen from '../screens/FoodDiaryScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import AddFoodManuallyScreen from '../screens/AddFoodManuallyScreen';

// Define the types for our navigation
export type RootStackParamList = {
  Main: undefined;
  FoodDetail: { foodId: string };
  AddFoodManually: undefined;
  CameraScreen: undefined;
};

export type TabParamList = {
  Diary: undefined;
  Camera: undefined;
  Recommendations: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Use icon names that definitely exist in Ionicons
          if (route.name === 'Diary') {
            return <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />;
          } else if (route.name === 'Camera') {
            return <Ionicons name={focused ? 'camera' : 'camera-outline'} size={size} color={color} />;
          } else if (route.name === 'Recommendations') {
            return <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={size} color={color} />;
          }
          
          // Default icon as fallback
          return <Ionicons name="help-circle-outline" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Diary" 
        component={FoodDiaryScreen} 
        options={{ title: 'Food Diary' }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: 'Log Food' }}
      />
      <Tab.Screen 
        name="Recommendations" 
        component={RecommendationScreen} 
        options={{ title: 'What to Eat?' }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="FoodDetail" 
          component={FoodDetailScreen} 
          options={{ title: 'Food Details' }}
        />
        <Stack.Screen 
          name="AddFoodManually" 
          component={AddFoodManuallyScreen} 
          options={{ title: 'Add Food' }}
        />
        <Stack.Screen 
          name="CameraScreen" 
          component={CameraScreen} 
          options={{ title: 'Take Photo of Food' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}