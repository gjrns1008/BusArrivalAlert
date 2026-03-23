import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import BusListScreen from '../screens/BusListScreen';
import ArrivalScreen from '../screens/ArrivalScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Arrival: { stationId: string; stationName: string };
};

export type MainTabParamList = {
  Home: undefined;
  BusList: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabBarHomeIcon({ color, size }: { color: string; size: number }) {
  return <Icon name="home" size={size} color={color} />;
}

function TabBarBusIcon({ color, size }: { color: string; size: number }) {
  return <Icon name="directions-bus" size={size} color={color} />;
}

function TabBarSettingsIcon({ color, size }: { color: string; size: number }) {
  return <Icon name="settings" size={size} color={color} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: TabBarHomeIcon,
        }}
      />
      <Tab.Screen
        name="BusList"
        component={BusListScreen}
        options={{
          tabBarLabel: '버스 검색',
          tabBarIcon: TabBarBusIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: TabBarSettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Arrival"
          component={ArrivalScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.stationName,
            headerStyle: { backgroundColor: '#2196F3' },
            headerTintColor: '#fff',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
