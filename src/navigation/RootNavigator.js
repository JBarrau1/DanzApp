// Main Navigator
// Root navigation with stack and tabs

import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getTheme } from '../theme';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ElencoDetailScreen } from '../views/screens/ElencoDetailScreen';
import { AddElencoScreen } from '../views/screens/AddElencoScreen';
import { TakeAttendanceScreen } from '../views/screens/TakeAttendanceScreen';
import { AttendanceHistoryScreen } from '../views/screens/AttendanceHistoryScreen';
import { StudentPaymentScreen } from '../views/screens/StudentPaymentScreen';
import { AddStudentScreen } from '../views/screens/AddStudentScreen';

const Stack = createStackNavigator();

export const RootNavigator = () => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="ElencoDetail" component={ElencoDetailScreen} />
      <Stack.Screen name="AddElenco" component={AddElencoScreen} />
      <Stack.Screen name="TakeAttendance" component={TakeAttendanceScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      <Stack.Screen name="StudentPayment" component={StudentPaymentScreen} />
      <Stack.Screen name="AddStudent" component={AddStudentScreen} />
    </Stack.Navigator>
  );
};
