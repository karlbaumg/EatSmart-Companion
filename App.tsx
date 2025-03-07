import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation';
import { FoodProvider } from './context/FoodContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <FoodProvider>
        <Navigation />
        <StatusBar style="auto" />
      </FoodProvider>
    </SafeAreaProvider>
  );
}