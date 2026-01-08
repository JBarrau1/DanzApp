// Main Navigator
// Root navigation with stack and tabs

import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getTheme } from '../theme';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ElencoDetailScreen } from '../views/screens/elencos/ElencoDetailScreen';
import { AddElencoScreen } from '../views/screens/elencos/AddElencoScreen';
import { TakeAttendanceScreen } from '../views/screens/asistencias/TakeAttendanceScreen';
import { AttendanceHistoryScreen } from '../views/screens/asistencias/AttendanceHistoryScreen';
import { StudentPaymentScreen } from '../views/screens/pagos/StudentPaymentScreen';
import { AddStudentScreen } from '../views/screens/estudiantes/AddStudentScreen';
import { WelcomeScreen } from '../views/screens/autenticacion/WelcomeScreen';
import { LoginScreen } from '../views/screens/autenticacion/LoginScreen';
import { RegisterScreen } from '../views/screens/autenticacion/RegisterScreen';
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
        // Match the Auth background color (#597870) to prevent white flash during auth transitions.
        // For logged-in screens, the screens themselves define their own background.
        cardStyle: { backgroundColor: session ? theme.colors.background : '#597870' },
        animationEnabled: true,
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
        <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
