import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useAlert } from '../../../context/AlertContext';
import { getTheme } from '../../../theme';
import { useColorScheme } from 'react-native';
import { supabase } from '../../../config/supabase';

export const LoginScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const styles = makeStyles(theme);
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({ title: 'Error', message: 'Por favor completa todos los campos.' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showAlert({ title: 'Error', message: 'Correo o contraseña incorrectos.' });
        } else {
          showAlert({ title: 'Error', message: error.message });
        }
      }
    } catch (e) {
      showAlert({ title: 'Error', message: 'Ocurrió un error inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Iniciar Sesión</Text>
            <View style={{ width: 28 }} /> 
          </View>

          <ScrollView 
             contentContainerStyle={styles.container}
             showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>¡Hola de nuevo!</Text>
                <Text style={styles.welcomeSubtitle}>Ingresa tus credenciales para continuar</Text>
              </View>

              <CustomInput
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                variant="glass"
                labelStyle={{ color: '#FFF' }}
              />

              <CustomInput
                label="Contraseña"
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                variant="glass"
                labelStyle={{ color: '#FFF' }}
              />

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => showAlert({
                  title: 'Información',
                  message: 'Contacta al administrador para restablecer tu contraseña.',
                  buttons: [{ text: 'Entendido' }]
                })}
              >
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <View style={styles.spacing} />

              <CustomButton
                title="Ingresar"
                onPress={handleLogin}
                loading={loading}
                style={styles.submitButton}
                textStyle={styles.submitButtonText}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  container: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    flexGrow: 1,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  welcomeTextContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  spacing: {
    height: 32,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#597870',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
