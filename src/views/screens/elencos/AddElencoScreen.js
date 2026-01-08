// Add Elenco Screen (Enhanced with validations and pickers)
// Form to add a new dance group with proper validations

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../../theme';
import { Card } from '../../components/Card';
import { SchedulePicker } from '../../components/SchedulePicker';
import { ElencoService } from '../../../services/ElencoService';

export const AddElencoScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    edad_minima: '',
    edad_maxima: '',
  });
  const [schedules, setSchedules] = useState([]);

  const handleNombreChange = (text) => {
    // Convert to uppercase and limit to 15 characters
    const upperText = text.toUpperCase().slice(0, 15);
    setFormData({ ...formData, nombre: upperText });
  };

  const handleDescripcionChange = (text) => {
    // Limit to 150 characters
    const limitedText = text.slice(0, 150);
    setFormData({ ...formData, descripcion: limitedText });
  };

  const handleEdadChange = (field, text) => {
    // Only allow numbers and max 2 digits
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 2);
    setFormData({ ...formData, [field]: numericText });
  };

  const formatScheduleForDB = () => {
    if (schedules.length === 0) return null;
    
    const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return schedules.map(s => {
      const startTime = s.startTime.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      const endTime = s.endTime.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      return `${DAYS[s.day]} ${startTime}-${endTime}`;
    }).join(', ');
  };

  const handleSubmit = async () => {
    console.log('📝 Submitting elenco:', formData);
    
    // Validations
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del elenco es requerido');
      return;
    }

    if (schedules.length < 2) {
      Alert.alert('Error', 'Debes agregar al menos 2 horarios');
      return;
    }

    if (schedules.length > 5) {
      Alert.alert('Error', 'Máximo 5 horarios permitidos');
      return;
    }

    // Validate age range
    if (formData.edad_minima && formData.edad_maxima) {
      const min = parseInt(formData.edad_minima);
      const max = parseInt(formData.edad_maxima);
      if (min > max) {
        Alert.alert('Error', 'La edad mínima no puede ser mayor que la edad máxima');
        return;
      }
    }

    try {
      setLoading(true);
      console.log('🚀 Creating elenco in Supabase...');
      
      const result = await ElencoService.create({
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        horario: formatScheduleForDB(),
        edad_minima: formData.edad_minima ? parseInt(formData.edad_minima) : null,
        edad_maxima: formData.edad_maxima ? parseInt(formData.edad_maxima) : null,
        activo: true,
      });

      console.log('📊 Create result:', result);

      if (result.success) {
        console.log('✅ Elenco created successfully!');
        Alert.alert(
          'Éxito',
          'Elenco creado correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        console.error('❌ Failed to create elenco:', result.error);
        Alert.alert('Error', result.error || 'No se pudo crear el elenco');
      }
    } catch (error) {
      console.error('💥 Error creating elenco:', error);
      Alert.alert('Error', 'Ocurrió un error al crear el elenco');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container(theme)} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton(theme)}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle(theme)}>Nuevo Elenco</Text>
          <Text style={styles.headerSubtitle(theme)}>Crear grupo de danza</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Card>
            <View style={styles.form}>
              {/* Nombre */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label(theme)}>Nombre del Elenco *</Text>
                  <Text style={styles.charCount(theme)}>
                    {formData.nombre.length}/15
                  </Text>
                </View>
                <TextInput
                  style={styles.input(theme)}
                  value={formData.nombre}
                  onChangeText={handleNombreChange}
                  placeholder="Ej: JUVENIL A"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={15}
                  autoCapitalize="characters"
                />
              </View>

              {/* Descripción */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label(theme)}>Descripción</Text>
                  <Text style={styles.charCount(theme)}>
                    {formData.descripcion.length}/150
                  </Text>
                </View>
                <TextInput
                  style={[styles.input(theme), styles.textArea]}
                  value={formData.descripcion}
                  onChangeText={handleDescripcionChange}
                  placeholder="Descripción del grupo"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  maxLength={150}
                />
              </View>

              {/* Horarios */}
              <View style={styles.formGroup}>
                <Text style={styles.label(theme)}>
                  Horarios * (mínimo 2, máximo 5)
                </Text>
                <SchedulePicker
                  schedules={schedules}
                  onChange={setSchedules}
                  theme={theme}
                />
              </View>

              {/* Edades */}
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label(theme)}>Edad Mínima</Text>
                  <TextInput
                    style={styles.input(theme)}
                    value={formData.edad_minima}
                    onChangeText={(text) => handleEdadChange('edad_minima', text)}
                    placeholder="Ej: 8"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label(theme)}>Edad Máxima</Text>
                  <TextInput
                    style={styles.input(theme)}
                    value={formData.edad_maxima}
                    onChangeText={(text) => handleEdadChange('edad_maxima', text)}
                    placeholder="Ej: 12"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>
          </Card>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton(theme)}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.card} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.card} />
                <Text style={styles.submitButtonText(theme)}>Crear Elenco</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: (theme) => ({
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  }),
  headerContent: {
    flex: 1,
  },
  headerTitle: (theme) => ({
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  }),
  headerSubtitle: (theme) => ({
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: (theme) => ({
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  charCount: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
  }),
  input: (theme) => ({
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  }),
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  }),
  submitButtonText: (theme) => ({
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.card,
  }),
};
