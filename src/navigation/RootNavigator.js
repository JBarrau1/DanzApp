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
import { LoginScreen } from '../views/screens/login/LoginScreen';
import { supabase } from '../config/supabase';

const Stack = createStackNavigator();

export const RootNavigator = () => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // 1. Check initial session
    const checkSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
      } catch (e) {
        console.error('Check session error', e);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
     // You might want a nicer Loading Screen here
     return null; 
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {session ? (
        // Authenticated Stack
        <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="ElencoDetail" component={ElencoDetailScreen} />
            <Stack.Screen name="AddElenco" component={AddElencoScreen} />
            <Stack.Screen name="TakeAttendance" component={TakeAttendanceScreen} />
            <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
            <Stack.Screen name="StudentPayment" component={StudentPaymentScreen} />
            <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        </>
      ) : (
        // Auth Stack
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};
