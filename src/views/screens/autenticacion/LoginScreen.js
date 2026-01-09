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

  const backgroundColor = colorScheme === 'dark' ? '#292929' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const subtitleColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            <View style={styles.welcomeTextContainer}>
              <Text style={[styles.welcomeTitle, { color: textColor }]}>¡Hola de nuevo!</Text>
              <Text style={[styles.welcomeSubtitle, { color: subtitleColor }]}>
                Ingresa tus credenciales para continuar
              </Text>
            </View>

            <View style={styles.formContainer}>
              <CustomInput
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                variant="default" 
              />

              <CustomInput
                label="Contraseña"
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                variant="default"
              />

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => showAlert({
                  title: 'Información',
                  message: 'Contacta al administrador para restablecer tu contraseña.',
                  buttons: [{ text: 'Entendido' }]
                })}
              >
                <Text style={[styles.forgotPasswordText, { color: textColor }]}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              <View style={styles.spacing} />

              <CustomButton
                title="Ingresar"
                onPress={handleLogin}
                loading={loading}
                style={[styles.submitButton, { backgroundColor: textColor }]} 
                textStyle={[styles.submitButtonText, { color: backgroundColor }]}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8, // Align with padding
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  welcomeTextContainer: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  spacing: {
    height: 20,
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
