// Add Student Screen - Student Registration
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTheme } from '../../theme';
import { Card } from '../components/Card';
import { EstudianteService } from '../../services/EstudianteService';
import { ElencoService } from '../../services/ElencoService';

export const AddStudentScreen = ({ route, navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const { elencoId: preselectedElencoId } = route.params || {};
  
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefonoTutor, setTelefonoTutor] = useState('');
  const [elencoId, setElencoId] = useState(preselectedElencoId || null);
  const [fechaInscripcion, setFechaInscripcion] = useState(new Date());
  const [montoMens, setMontoMens] = useState('200');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [elencos, setElencos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadElencos();
  }, []);

  const loadElencos = async () => {
    const result = await ElencoService.getAll();
    if (result.success) setElencos(result.data);
  };

  const handleSave = async () => {
    if (!nombres.trim() || !apellidos.trim() || !telefonoTutor.trim() || !elencoId) {
      Alert.alert('Error', 'Completa todos los campos requeridos');
      return;
    }

    const monto = parseFloat(montoMens);
    if (isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Ingresa un monto mensual válido');
      return;
    }

    try {
      setLoading(true);
      const result = await EstudianteService.createWithMensualidades({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        telefono_tutor: telefonoTutor.trim(),
        elenco_id: elencoId,
        fecha_inscripcion: fechaInscripcion.toISOString().split('T')[0],
        monto_mens: monto,
        activo: true,
      });

      if (result.success) {
        Alert.alert(
          '¡Éxito!',
          `Estudiante creado. ${result.data.mensualidadesCreated} mensualidades generadas automáticamente`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container(theme)} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton(theme)}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle(theme)}>Nuevo Estudiante</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Card>
            <Text style={styles.sectionTitle(theme)}>Información Personal</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Nombres *</Text>
              <TextInput style={styles.input(theme)} value={nombres} onChangeText={setNombres} placeholder="Juan" placeholderTextColor={theme.colors.textSecondary} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Apellidos *</Text>
              <TextInput style={styles.input(theme)} value={apellidos} onChangeText={setApellidos} placeholder="Pérez" placeholderTextColor={theme.colors.textSecondary} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Teléfono del Tutor *</Text>
              <TextInput style={styles.input(theme)} value={telefonoTutor} onChangeText={setTelefonoTutor} placeholder="12345678" placeholderTextColor={theme.colors.textSecondary} keyboardType="phone-pad" />
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle(theme)}>Información Académica</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Elenco *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.elencoScroll}>
                {elencos.map((elenco) => (
                  <TouchableOpacity
                    key={elenco.id}
                    style={[styles.elencoButton(theme), elencoId === elenco.id && styles.elencoButtonActive(theme)]}
                    onPress={() => setElencoId(elenco.id)}
                  >
                    <Text style={[styles.elencoButtonText(theme), elencoId === elenco.id && { color: theme.colors.card }]}>
                      {elenco.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Fecha de Inscripción *</Text>
              <TouchableOpacity style={styles.dateButton(theme)} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.dateButtonText(theme)}>{fechaInscripcion.toLocaleDateString('es-ES')}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker value={fechaInscripcion} mode="date" display="default" onChange={(e, date) => { setShowDatePicker(false); if (date) setFechaInscripcion(date); }} />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Monto Mensual (Bs.) *</Text>
              <TextInput style={styles.input(theme)} value={montoMens} onChangeText={setMontoMens} placeholder="200.00" placeholderTextColor={theme.colors.textSecondary} keyboardType="decimal-pad" />
              <Text style={styles.hint(theme)}>Este monto se usará para todas las mensualidades</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton(theme)} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.colors.card} /> : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.card} />
              <Text style={styles.saveButtonText(theme)}>Guardar Estudiante</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: (theme) => ({ flex: 1, backgroundColor: theme.colors.background }),
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  backButton: (theme) => ({ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, justifyContent: 'center', alignItems: 'center' }),
  headerTitle: (theme) => ({ fontSize: 20, fontWeight: '700', color: theme.colors.text }),
  section: { padding: 20, gap: 16 },
  sectionTitle: (theme) => ({ fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 16 }),
  formGroup: { marginBottom: 16 },
  label: (theme) => ({ fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 }),
  input: (theme) => ({ backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: theme.colors.text }),
  hint: (theme) => ({ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }),
  elencoScroll: { marginTop: 8 },
  elencoButton: (theme) => ({ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, marginRight: 8 }),
  elencoButtonActive: (theme) => ({ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }),
  elencoButtonText: (theme) => ({ fontSize: 14, fontWeight: '600', color: theme.colors.text }),
  dateButton: (theme) => ({ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 16, gap: 12 }),
  dateButtonText: (theme) => ({ flex: 1, fontSize: 15, color: theme.colors.text }),
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  saveButton: (theme) => ({ backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }),
  saveButtonText: (theme) => ({ fontSize: 16, fontWeight: '700', color: theme.colors.card }),
};
