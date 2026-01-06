// Attendance Screen (Redesigned with Elencos)
// Shows dance groups (elencos) as cards

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../theme';
import { ElencoCard } from '../components/ElencoCard';
import { ElencoService } from '../../services/ElencoService';
import { EstudianteService } from '../../services/EstudianteService';
import { supabase } from '../../config/supabase';

export const AttendanceScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [elencos, setElencos] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test Supabase connection first
    testConnection();
    loadData();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🔌 Testing Supabase connection...');
      const { data, error } = await supabase.from('elencos').select('count');
      if (error) {
        console.error('❌ Connection test failed:', error);
      } else {
        console.log('✅ Supabase connection successful!');
      }
    } catch (err) {
      console.error('💥 Connection test error:', err);
    }
  };

  const loadData = async () => {
    try {
      console.log('🎯 AttendanceScreen: Starting to load data...');
      setLoading(true);
      setError(null);
      
      // Load elencos
      console.log('📞 Calling ElencoService.getActive()...');
      const elencosResult = await ElencoService.getActive();
      console.log('📦 Elencos result:', elencosResult);
      
      if (elencosResult.success) {
        console.log('✅ Setting elencos:', elencosResult.data);
        setElencos(elencosResult.data);
        
        // Load student counts for each elenco
        const counts = {};
        for (const elenco of elencosResult.data) {
          const studentsResult = await EstudianteService.getByElenco(elenco.id);
          if (studentsResult.success) {
            counts[elenco.id] = studentsResult.data.length;
          }
        }
        console.log('👥 Student counts:', counts);
        setStudentCounts(counts);
      } else {
        console.error('❌ Failed to load elencos:', elencosResult.error);
        setError(elencosResult.error);
      }
    } catch (err) {
      console.error('💥 Error loading elencos:', err);
      setError('Error al cargar los elencos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleElencoPress = (elenco) => {
    navigation.navigate('ElencoDetail', { elenco });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container(theme)} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle(theme)}>Elencos</Text>
          <Text style={styles.headerSubtitle(theme)}>
            Grupos de danza
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText(theme)}>Cargando elencos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container(theme)} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle(theme)}>Elencos</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
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
          <View>
            <Text style={styles.headerTitle(theme)}>Elencos</Text>
            <Text style={styles.headerSubtitle(theme)}>
              {elencos.length} {elencos.length === 1 ? 'grupo' : 'grupos'} de danza
            </Text>
          </View>
          <TouchableOpacity
            style={styles.historyButton(theme)}
            onPress={() => navigation.navigate('AttendanceHistory')}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard(theme)}>
              <View style={styles.summaryIconContainer(theme, theme.colors.primary)}>
                <Ionicons name="people" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.summaryValue(theme)}>{elencos.length}</Text>
              <Text style={styles.summaryLabel(theme)}>Elencos</Text>
            </View>

            <View style={styles.summaryCard(theme)}>
              <View style={styles.summaryIconContainer(theme, theme.colors.success)}>
                <Ionicons name="person" size={24} color={theme.colors.success} />
              </View>
              <Text style={styles.summaryValue(theme)}>
                {Object.values(studentCounts).reduce((a, b) => a + b, 0)}
              </Text>
              <Text style={styles.summaryLabel(theme)}>Estudiantes</Text>
            </View>
          </View>
        </View>

        {/* Elencos List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>Todos los Elencos</Text>
          
          {elencos.length > 0 ? (
            elencos.map((elenco) => (
              <ElencoCard
                key={elenco.id}
                elenco={elenco}
                theme={theme}
                studentCount={studentCounts[elenco.id] || 0}
                onPress={() => handleElencoPress(elenco)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText(theme)}>
                No hay elencos registrados
              </Text>
              <Text style={styles.emptySubtext(theme)}>
                Los grupos de danza aparecerán aquí
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab(theme)}
        onPress={() => navigation.navigate('AddElenco')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={theme.colors.card} />
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyButton: (theme) => ({
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  }),
  headerTitle: (theme) => ({
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  }),
  headerSubtitle: (theme) => ({
    fontSize: 16,
    color: theme.colors.textSecondary,
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.small,
  }),
  summaryIconContainer: (theme, color) => ({
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  }),
  summaryValue: (theme) => ({
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  }),
  summaryLabel: (theme) => ({
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  }),
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: (theme) => ({
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
  }),
  errorText: (theme) => ({
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  }),
  retryButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  }),
  retryButtonText: (theme) => ({
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.card,
  }),
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: (theme) => ({
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 4,
  }),
  emptySubtext: (theme) => ({
    fontSize: 14,
    color: theme.colors.textSecondary,
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
