import React, { useState } from 'react';
import { StyleSheet, View, Text, useColorScheme, Platform, ScrollView, Alert, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { supabase } from '../../../config/supabase';
import { getTheme } from '../../../theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

// Use require for local assets to ensure they load
const loginBg = require('../../../assets/images/login_bg.png');

export const LoginScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const styles = makeStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos.');
        } else {
          setError(error.message);
        }
      }
    } catch (e) {
      setError('Ocurrió un error inesperado.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={loginBg} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.container} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerContent}>
            <BlurView intensity={30} tint="dark" style={styles.glassContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>DanzApp</Text>
                <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
              </View>

              <View style={styles.formContainer}>
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorTextLarge}>{error}</Text>
                  </View>
                )}

                <CustomInput
                  label="Usuario / Email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  variant="glass"
                />

                <CustomInput
                  label="Contraseña"
                  placeholder="********"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  secureTextEntry
                  variant="glass"
                />

                <CustomButton
                  title="Iniciar Sesión"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.loginButton}
                  disabled={loading}
                />

                <CustomButton
                  title="¿Olvidaste tu contraseña?"
                  type="text"
                  onPress={() => Alert.alert('Información', 'Contacta al administrador.')}
                  style={styles.forgotButton}
                  textStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
              </View>
            </BlurView>
            
            <Text style={styles.footerText}>Created by DanzApp Team</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  glassContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(0,0,0,0.1)', // Slight dark tint base
    marginBottom: theme.spacing.xxl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeightBold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: theme.typography.fontSizeMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  loginButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#7CB342', // A nice green similar to the example or keep theme primary
    // If you prefer theme primary, delete backgroundColor line
  },
  forgotButton: {
    marginTop: theme.spacing.xs,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.8)', 
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  errorTextLarge: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: theme.typography.fontWeightMedium,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 20,
  }
});
