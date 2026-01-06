// Bottom Tab Navigator (Modern Floating Design)
// Navigation configuration with custom floating tab bar

import React from 'react';
import { useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getTheme } from '../theme';
import { HomeScreen } from '../views/screens/HomeScreen';
import { AttendanceScreen } from '../views/screens/AttendanceScreen';
import { PaymentScreen } from '../views/screens/PaymentScreen';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Asistencia"
        component={AttendanceScreen}
        options={{
          tabBarLabel: 'Asistencia',
        }}
      />
      <Tab.Screen
        name="Mensualidades"
        component={PaymentScreen}
        options={{
          tabBarLabel: 'Mensualidades',
        }}
      />
    </Tab.Navigator>
  );
};
