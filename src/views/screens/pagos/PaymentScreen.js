// Payment Screen - Overview
// Shows payment statistics and students with pending/overdue payments

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../../theme';
import { Card } from '../../components/Card';
import { MensualidadService } from '../../../services/MensualidadService';

export const PaymentScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [stats, setStats] = useState(null);
  const [overdueMensualidades, setOverdueMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResult = await MensualidadService.getStatistics();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Load overdue payments
      const overdueResult = await MensualidadService.getOverdue();
      if (overdueResult.success) {
        setOverdueMensualidades(overdueResult.data);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStudentPress = (mensualidad) => {
    // Navigate to student payment screen
    // We need to get the full student object first
    navigation.navigate('StudentPayment', { 
      student: { 
        id: mensualidad.estudiante_id,
        // We'll need to fetch full student data in StudentPaymentScreen
      } 
    });
  };

  return (
    <SafeAreaView style={styles.container(theme)} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle(theme)}>Pagos</Text>
          <Text style={styles.headerSubtitle(theme)}>Gestión de mensualidades</Text>
        </View>

        {loading ? (
          <View style={styles.section}>
            <Card>
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText(theme)}>Cargando datos...</Text>
              </View>
            </Card>
          </View>
        ) : (
          <>
            {/* Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle(theme)}>Resumen del Mes</Text>
              <Card>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Ionicons name="cash" size={32} color={theme.colors.success} />
                    <Text style={[styles.statValue(theme), { color: theme.colors.success }]}>
                      Bs. {stats?.paidAmount?.toFixed(2) || '0.00'}
                    </Text>
                    <Text style={styles.statLabel(theme)}>Ingresos</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={32} color={theme.colors.warning} />
                    <Text style={[styles.statValue(theme), { color: theme.colors.warning }]}>
                      Bs. {stats?.pendingAmount?.toFixed(2) || '0.00'}
                    </Text>
                    <Text style={styles.statLabel(theme)}>Pendiente</Text>
                  </View>
                </View>
              </Card>

              <Card>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge(theme, theme.colors.success)}>
                    <Text style={styles.statBadgeValue(theme)}>{stats?.pagado || 0}</Text>
                    <Text style={styles.statBadgeLabel(theme)}>Pagados</Text>
                  </View>
                  <View style={styles.statBadge(theme, theme.colors.warning)}>
                    <Text style={styles.statBadgeValue(theme)}>{stats?.pendiente || 0}</Text>
                    <Text style={styles.statBadgeLabel(theme)}>Pendientes</Text>
                  </View>
                  <View style={styles.statBadge(theme, theme.colors.error)}>
                    <Text style={styles.statBadgeValue(theme)}>{stats?.vencido || 0}</Text>
                    <Text style={styles.statBadgeLabel(theme)}>Vencidos</Text>
                  </View>
                  <View style={styles.statBadge(theme, theme.colors.info)}>
                    <Text style={styles.statBadgeValue(theme)}>{stats?.parcial || 0}</Text>
                    <Text style={styles.statBadgeLabel(theme)}>Parciales</Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* Overdue Payments */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle(theme)}>Pagos Vencidos</Text>
                {overdueMensualidades.length > 0 && (
                  <View style={styles.badge(theme)}>
                    <Text style={styles.badgeText(theme)}>{overdueMensualidades.length}</Text>
                  </View>
                )}
              </View>

              {overdueMensualidades.length > 0 ? (
                overdueMensualidades.map((mensualidad) => (
                  <TouchableOpacity
                    key={mensualidad.id}
                    activeOpacity={0.7}
                    onPress={() => handleStudentPress(mensualidad)}
                  >
                    <Card>
                      <View style={styles.overdueCard}>
                        <View style={styles.overdueIcon(theme)}>
                          <Ionicons name="alert-circle" size={32} color={theme.colors.error} />
                        </View>
                        <View style={styles.overdueInfo}>
                          <Text style={styles.overdueName(theme)}>
                            {mensualidad.estudiante_nombre}
                          </Text>
                          <Text style={styles.overdueElenco(theme)}>
                            {mensualidad.elenco_nombre}
                          </Text>
                          <Text style={styles.overdueAmount(theme)}>
                            Debe: Bs. {mensualidad.getMontoRestante().toFixed(2)}
                          </Text>
                          <Text style={styles.overdueDate(theme)}>
                            Vencido: {new Date(mensualidad.fecha_vencimiento).toLocaleDateString('es-ES')}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))
              ) : (
                <Card>
                  <View style={styles.centerContent}>
                    <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
                    <Text style={styles.emptyText(theme)}>
                      No hay pagos vencidos
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: (theme) => ({ flex: 1, backgroundColor: theme.colors.background }),
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: (theme) => ({ fontSize: 32, fontWeight: '700', color: theme.colors.text }),
  headerSubtitle: (theme) => ({ fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 }),
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: (theme) => ({ fontSize: 18, fontWeight: '700', color: theme.colors.text }),
  badge: (theme) => ({
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  }),
  badgeText: (theme) => ({ fontSize: 12, fontWeight: '700', color: theme.colors.card }),
  statsGrid: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 8 },
  statValue: (theme) => ({ fontSize: 20, fontWeight: '700', color: theme.colors.text }),
  statLabel: (theme) => ({ fontSize: 12, color: theme.colors.textSecondary }),
  statsRow: { flexDirection: 'row', gap: 12 },
  statBadge: (theme, color) => ({
    flex: 1,
    backgroundColor: color + '15',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  }),
  statBadgeValue: (theme) => ({ fontSize: 20, fontWeight: '700', color: theme.colors.text }),
  statBadgeLabel: (theme) => ({ fontSize: 10, color: theme.colors.textSecondary, marginTop: 4 }),
  overdueCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  overdueIcon: (theme) => ({
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  overdueInfo: { flex: 1 },
  overdueName: (theme) => ({ fontSize: 16, fontWeight: '600', color: theme.colors.text }),
  overdueElenco: (theme) => ({ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }),
  overdueAmount: (theme) => ({ fontSize: 14, fontWeight: '600', color: theme.colors.error, marginTop: 4 }),
  overdueDate: (theme) => ({ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }),
  centerContent: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  loadingText: (theme) => ({ fontSize: 14, color: theme.colors.textSecondary }),
  emptyText: (theme) => ({ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' }),
};
