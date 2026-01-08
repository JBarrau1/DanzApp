// Home Screen
// Dashboard with overview statistics and recent activities

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../../theme';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { HomeController } from '../../../controllers/HomeController';

export const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [controller] = useState(() => new HomeController());
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statistics = await controller.getStatistics();
      const recentActivities = await controller.getRecentActivities();
      setStats(statistics);
      setActivities(recentActivities);
    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container(theme)} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText(theme)}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container(theme)} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText(theme)}>{error}</Text>
          <TouchableOpacity onPress={loadData} style={styles.retryButton(theme)}>
            <Text style={styles.retryButtonText(theme)}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container(theme)} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle(theme)}>Inicio</Text>
          <Text style={styles.headerSubtitle(theme)}>
            Bienvenido a DanzApp
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>Estadísticas</Text>
          
          <StatCard
            icon="people"
            title="Estudiantes Activos"
            value={stats.activeStudents}
            subtitle={`Total: ${stats.totalStudents}`}
            color={theme.colors.primary}
          />
          
          <StatCard
            icon="checkmark-circle"
            title="Asistencia Hoy"
            value={`${stats.presentToday}/${stats.totalToday}`}
            subtitle="Presentes hoy"
            color={theme.colors.success}
          />
          
          <StatCard
            icon="cash-outline"
            title="Pagos Pendientes"
            value={stats.pendingPayments}
            subtitle={stats.overduePayments > 0 ? `${stats.overduePayments} vencidos` : 'Al día'}
            color={stats.overduePayments > 0 ? theme.colors.error : theme.colors.warning}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>Actividad Reciente</Text>
          
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <Card key={index}>
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon(theme)}>
                    <Ionicons
                      name={activity.icon}
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle(theme)}>
                      {activity.title}
                    </Text>
                    <Text style={styles.activityDate(theme)}>
                      {new Date(activity.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText(theme)}>
                No hay actividad reciente
              </Text>
            </Card>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: (theme) => ({
    fontSize: theme.typography.fontSizeMedium,
    color: theme.colors.textSecondary,
  }),
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: (theme) => ({
    fontSize: theme.typography.fontSizeXXLarge,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    marginBottom: 4,
  }),
  headerSubtitle: (theme) => ({
    fontSize: theme.typography.fontSizeMedium,
    color: theme.colors.textSecondary,
  }),
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: (theme) => ({
    fontSize: theme.typography.fontSizeLarge,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    marginBottom: 10,
  }),
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: (theme) => ({
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  }),
  activityContent: {
    flex: 1,
  },
  activityTitle: (theme) => ({
    fontSize: theme.typography.fontSizeMedium,
    color: theme.colors.text,
    marginBottom: 2,
  }),
  activityDate: (theme) => ({
    fontSize: theme.typography.fontSizeSmall,
    color: theme.colors.textSecondary,
  }),
  emptyText: (theme) => ({
    fontSize: theme.typography.fontSizeMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  }),
  errorText: (theme) => ({
    fontSize: theme.typography.fontSizeMedium,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  }),
  retryButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  }),
  retryButtonText: (theme) => ({
    fontSize: theme.typography.fontSizeMedium,
    color: theme.colors.card,
    fontWeight: theme.typography.fontWeightBold,
  }),
};
