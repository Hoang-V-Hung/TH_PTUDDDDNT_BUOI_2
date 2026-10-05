import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import { HourlyDetailScreen } from '../screens/HourlyDetailScreen';
import { DailyDetailScreen } from '../screens/DailyDetailScreen';
import { RootStackParamList } from '../types/weather';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        orientation: 'portrait',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="HourlyDetail"
        component={HourlyDetailScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="DailyDetail"
        component={DailyDetailScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
