import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import FoodDiaryScreen from '../screens/FoodDiaryScreen';
import MealSuggestionsScreen from '../screens/MealSuggestionsScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';

// Define the types for our navigation
export type RootStackParamList = {
  Main: undefined;
  Camera: undefined;
  MealSuggestions: undefined;
  FoodDiary: undefined;
  FoodDetail: { foodId: string };
};

export type TabParamList = {
  Home: undefined;
  Diary: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          } else if (route.name === 'Diary') {
            return <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />;
          }
          
          // Default icon as fallback
          return <Ionicons name="help-circle-outline" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Diary" 
        component={FoodDiaryScreen} 
        options={{ title: 'Food History' }}
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
          name="Camera" 
          component={CameraScreen} 
          options={{ title: 'Take Photo of Food' }}
        />
        <Stack.Screen 
          name="MealSuggestions" 
          component={MealSuggestionsScreen} 
          options={{ title: 'Meal Suggestions', headerShown: false }}
        />
        <Stack.Screen 
          name="FoodDiary" 
          component={FoodDiaryScreen} 
          options={{ title: 'Food History' }}
        />
        <Stack.Screen 
          name="FoodDetail" 
          component={FoodDetailScreen} 
          options={{ title: 'Food Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}