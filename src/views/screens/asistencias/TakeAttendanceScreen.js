// Take Attendance Screen
// Screen to mark attendance for all students in an elenco

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../../theme';
import { Card } from '../../components/Card';
import { AsistenciaService } from '../../../services/AsistenciaService';
import { Estudiante } from '../../../models/Estudiante';

const STATUS_OPTIONS = [
  { id: 'presente', label: 'Presente', icon: 'checkmark-circle', color: '#4CAF50' },
  { id: 'tardanza', label: 'Tardanza', icon: 'time', color: '#FF9800' },
  { id: 'ausente', label: 'Ausente', icon: 'close-circle', color: '#F44336' },
  { id: 'justificado', label: 'Justificado', icon: 'document-text', color: '#2196F3' },
];

export const TakeAttendanceScreen = ({ route, navigation }) => {
  const { elenco } = route.params;
  const students = route.params.students.map(s => Estudiante.fromJSON(s));
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const getMarkedCount = () => {
    return Object.keys(attendance).length;
  };

  const markAllAs = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (getMarkedCount() === 0) {
      Alert.alert('Atención', 'Debes marcar al menos un estudiante');
      return;
    }

    Alert.alert(
      'Confirmar',
      `¿Guardar asistencia de ${getMarkedCount()} estudiantes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('💾 Saving attendance records...');
              console.log('👥 Students data:', students.slice(0, 1)); // Log first student to see structure

              const promises = Object.entries(attendance).map(([studentId, status]) => {
                const student = students.find(s => s.id.toString() === studentId);
                console.log(`📝 Processing student ${studentId}:`, student);
                
                // Get current time in HH:MM:SS format
                const now = new Date();
                const timeString = now.toTimeString().split(' ')[0]; // Gets "HH:MM:SS"
                
                return AsistenciaService.create({
                  estudiante_id: studentId,
                  elenco_id: elenco.id,
                  fecha: date.toISOString().split('T')[0],
                  estado: status,
                  hora_inicio: timeString,
                  observaciones: '',
                });
              });

              const results = await Promise.all(promises);
              const successCount = results.filter(r => r.success).length;
              const failCount = results.length - successCount;

              console.log(`✅ Saved: ${successCount}, ❌ Failed: ${failCount}`);

              if (failCount === 0) {
                Alert.alert(
                  'Éxito',
                  `Asistencia guardada para ${successCount} estudiantes`,
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert(
                  'Parcialmente guardado',
                  `${successCount} guardados, ${failCount} fallaron`
                );
              }
            } catch (error) {
              console.error('Error saving attendance:', error);
              Alert.alert('Error', 'No se pudo guardar la asistencia');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle(theme)}>Tomar Asistencia</Text>
          <Text style={styles.headerSubtitle(theme)}>
            {elenco.nombre} • {date.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar(theme)}>
        <View style={styles.statItem}>
          <Text style={styles.statValue(theme)}>{getMarkedCount()}</Text>
          <Text style={styles.statLabel(theme)}>Marcados</Text>
        </View>
        <View style={styles.statDivider(theme)} />
        <View style={styles.statItem}>
          <Text style={styles.statValue(theme)}>{students.length}</Text>
          <Text style={styles.statLabel(theme)}>Total</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickButton(theme, '#4CAF50')}
          onPress={() => markAllAs('presente')}
        >
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.quickButtonText(theme)}>Todos Presentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton(theme, '#F44336')}
          onPress={() => markAllAs('ausente')}
        >
          <Ionicons name="close-circle" size={20} color="#F44336" />
          <Text style={styles.quickButtonText(theme)}>Todos Ausentes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {students.map((student) => (
            <Card key={student.id}>
              <View style={styles.studentCard}>
                {/* Student Info */}
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar(theme)}>
                    <Ionicons name="person" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName(theme)}>
                      {student.getNombreCompleto()}
                    </Text>
                    {student.getEdad() && (
                      <Text style={styles.studentAge(theme)}>
                        {student.getEdad()} años
                      </Text>
                    )}
                  </View>
                </View>

                {/* Status Buttons */}
                <View style={styles.statusButtons}>
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = attendance[student.id] === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.statusButton(theme),
                          isSelected && styles.statusButtonActive(option.color),
                        ]}
                        onPress={() => handleStatusChange(student.id, option.id)}
                      >
                        <Ionicons
                          name={option.icon}
                          size={20}
                          color={isSelected ? '#FFFFFF' : option.color}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer(theme)}>
        <TouchableOpacity
          style={styles.saveButton(theme)}
          onPress={handleSave}
          disabled={loading || getMarkedCount() === 0}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.card} />
          ) : (
            <>
              <Ionicons name="save" size={24} color={theme.colors.card} />
              <Text style={styles.saveButtonText(theme)}>
                Guardar Asistencia ({getMarkedCount()})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  }),
  statsBar: (theme) => ({
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    ...theme.shadows.small,
  }),
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: (theme) => ({
    width: 1,
    backgroundColor: theme.colors.border,
  }),
  statValue: (theme) => ({
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
  }),
  statLabel: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  }),
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  quickButton: (theme, color) => ({
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color + '15',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  }),
  quickButtonText: (theme) => ({
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  studentCard: {
    gap: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: (theme) => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  }),
  studentDetails: {
    flex: 1,
  },
  studentName: (theme) => ({
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  studentAge: (theme) => ({
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: (theme) => ({
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  statusButtonActive: (color) => ({
    backgroundColor: color,
    borderColor: color,
  }),
  footer: (theme) => ({
    padding: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  }),
  saveButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }),
  saveButtonText: (theme) => ({
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.card,
  }),
};
