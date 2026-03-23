import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppPreferencesProvider } from './src/context/AppPreferencesContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <AppPreferencesProvider>
        <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
        <AppNavigator />
      </AppPreferencesProvider>
    </SafeAreaProvider>
  );
}

export default App;
