// Elenco Detail Screen
// Shows students in a specific elenco (dance group)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../theme';
import { Card } from '../components/Card';
import { EstudianteService } from '../../services/EstudianteService';

export const ElencoDetailScreen = ({ route, navigation }) => {
  const { elenco } = route.params;
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await EstudianteService.getByElenco(elenco.id);
      if (result.success) {
        setStudents(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Error al cargar estudiantes');
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
          <Text style={styles.headerTitle(theme)}>{elenco.nombre}</Text>
          {elenco.horario && (
            <Text style={styles.headerSubtitle(theme)}>{elenco.horario}</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Elenco Info Card */}
        <View style={styles.section}>
          <Card>
            <View style={styles.infoGrid}>
              {elenco.descripcion && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel(theme)}>Descripción</Text>
                  <Text style={styles.infoValue(theme)}>{elenco.descripcion}</Text>
                </View>
              )}
              
              {(elenco.edad_minima || elenco.edad_maxima) && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel(theme)}>Rango de Edad</Text>
                  <Text style={styles.infoValue(theme)}>
                    {elenco.getAgeRangeDisplay()}
                  </Text>
                </View>
              )}

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel(theme)}>Total Estudiantes</Text>
                <Text style={styles.infoValue(theme)}>{students.length}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Students List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>Estudiantes</Text>
          
          {loading ? (
            <Card>
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText(theme)}>Cargando estudiantes...</Text>
              </View>
            </Card>
          ) : error ? (
            <Card>
              <View style={styles.centerContent}>
                <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
                <Text style={styles.errorText(theme)}>{error}</Text>
                <TouchableOpacity onPress={loadStudents} style={styles.retryButton(theme)}>
                  <Text style={styles.retryButtonText(theme)}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : students.length > 0 ? (
            students.map((student) => (
              <TouchableOpacity
                key={student.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('StudentPayment', { student })}
              >
                <Card>
                  <View style={styles.studentCard}>
                    <View style={styles.studentAvatar(theme)}>
                      <Ionicons name="person" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName(theme)}>
                        {student.getNombreCompleto()}
                      </Text>
                      {student.getEdad() && (
                        <Text style={styles.studentAge(theme)}>
                          {student.getEdad()} años
                        </Text>
                      )}
                      {student.telefono_tutor && (
                        <Text style={styles.studentPhone(theme)}>
                          📞 {student.telefono_tutor}
                        </Text>
                      )}
                    </View>
                    <View style={styles.studentStatus}>
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: student.activo ? theme.colors.success : theme.colors.error }
                      ]} />
                      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <Card>
              <View style={styles.centerContent}>
                <Ionicons name="people-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText(theme)}>
                  No hay estudiantes en este elenco
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button - Take Attendance */}
      {students.length > 0 && (
        <TouchableOpacity
          style={styles.fab(theme)}
          onPress={() => navigation.navigate('TakeAttendance', { elenco, students })}
          activeOpacity={0.8}
        >
          <Ionicons name="clipboard" size={28} color={theme.colors.card} />
        </TouchableOpacity>
      )}
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
  sectionTitle: (theme) => ({
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  }),
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: (theme) => ({
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }),
  infoValue: (theme) => ({
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentAvatar: (theme) => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  studentInfo: {
    flex: 1,
  },
  studentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: (theme) => ({
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  studentAge: (theme) => ({
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  studentPhone: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  studentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailBadge: (theme) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  }),
  detailText: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
  }),
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: (theme) => ({
    fontSize: 14,
    color: theme.colors.textSecondary,
  }),
  errorText: (theme) => ({
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
  }),
  retryButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  }),
  retryButtonText: (theme) => ({
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.card,
  }),
  emptyText: (theme) => ({
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  }),
  fab: (theme) => ({
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
    elevation: 8,
  }),
};
