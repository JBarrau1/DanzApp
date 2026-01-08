import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useAlert } from '../../../context/AlertContext';
import { getTheme } from '../../../theme';
import { useColorScheme } from 'react-native';
import { supabase } from '../../../config/supabase';

export const RegisterScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const styles = makeStyles(theme);
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      showAlert({ title: 'Error', message: 'Por favor completa todos los campos' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      showAlert({ title: 'Error', message: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
          },
        },
      });

      if (error) throw error;

      showAlert({
        title: 'Registro Exitoso',
        message: 'Tu cuenta ha sido creada. Por favor verifica tu correo electrónico.',
        buttons: [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      });
    } catch (error) {
      showAlert({ title: 'Error', message: error.message });
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
            <Text style={styles.headerTitle}>Crear Cuenta</Text>
            <View style={{ width: 28 }} /> 
          </View>

          <ScrollView 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
             <View style={styles.formContainer}>
               <CustomInput
                 label="Nombre Completo"
                 placeholder="Ej. Juan Pérez"
                 value={form.fullName}
                 onChangeText={(text) => setForm({...form, fullName: text})}
                 variant="glass"
                 labelStyle={{ color: '#FFF' }}
               />
               
               <CustomInput
                 label="Correo Electrónico"
                 placeholder="ejemplo@correo.com"
                 value={form.email}
                 onChangeText={(text) => setForm({...form, email: text})}
                 keyboardType="email-address"
                 autoCapitalize="none"
                 variant="glass"
                 labelStyle={{ color: '#FFF' }}
               />

               <CustomInput
                 label="Contraseña"
                 placeholder="********"
                 value={form.password}
                 onChangeText={(text) => setForm({...form, password: text})}
                 secureTextEntry
                 variant="glass"
                 labelStyle={{ color: '#FFF' }}
               />

               <CustomInput
                 label="Confirmar Contraseña"
                 placeholder="********"
                 value={form.confirmPassword}
                 onChangeText={(text) => setForm({...form, confirmPassword: text})}
                 secureTextEntry
                 variant="glass"
                 labelStyle={{ color: '#FFF' }}
               />

               <View style={styles.spacing} />

               <CustomButton
                 title="Registrarse"
                 onPress={handleRegister}
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
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  spacing: {
    height: 20,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 28,
    marginTop: theme.spacing.md,
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
