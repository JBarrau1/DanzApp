import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getTheme } from '../../theme';
import { Card } from '../components/Card';
import { AsistenciaService } from '../../services/AsistenciaService';
import { ElencoService } from '../../services/ElencoService';

const STATUS_OPTIONS = [
  { id: 'todos', label: 'Todos', color: '#9E9E9E' },
  { id: 'presente', label: 'Presente', color: '#4CAF50' },
  { id: 'tardanza', label: 'Tardanza', color: '#FF9800' },
  { id: 'ausente', label: 'Ausente', color: '#F44336' },
  { id: 'justificado', label: 'Justificado', color: '#2196F3' },
];

export const AttendanceHistoryScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedElenco, setSelectedElenco] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [elencos, setElencos] = useState([]);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    presente: 0,
    tardanza: 0,
    ausente: 0,
    justificado: 0,
  });

  useEffect(() => {
    loadElencos();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [date]);

  useEffect(() => {
    applyFilters();
  }, [records, selectedElenco, selectedStatus]);

  const loadElencos = async () => {
    const result = await ElencoService.getAll();
    if (result.success) {
      setElencos(result.data);
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const result = await AsistenciaService.getByDate(date);
      
      if (result.success) {
        setRecords(result.data);
        calculateStats(result.data);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Filter by elenco
    if (selectedElenco) {
      filtered = filtered.filter(r => r.elenco_id === selectedElenco);
    }

    // Filter by status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(r => r.estado === selectedStatus);
    }

    setFilteredRecords(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      presente: data.filter(r => r.estado === 'presente').length,
      tardanza: data.filter(r => r.estado === 'tardanza').length,
      ausente: data.filter(r => r.estado === 'ausente').length,
      justificado: data.filter(r => r.estado === 'justificado').length,
    };
    setStats(stats);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const generatePDF = async () => {
    try {
      const html = generateHTMLReport();
      
      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({ html });
      
      console.log('PDF generated at:', uri);
      
      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir Reporte de Asistencias',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert(
          'PDF Generado',
          `El archivo se guardó en: ${uri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  const generateHTMLReport = () => {
    const dateStr = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const elencoName = selectedElenco 
      ? elencos.find(e => e.id === selectedElenco)?.nombre || 'Todos'
      : 'Todos';

    const percentage = stats.total > 0 
      ? ((stats.presente / stats.total) * 100).toFixed(1)
      : 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #666; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-item { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
          .stat-label { color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #4CAF50; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f5f5f5; }
          .presente { color: #4CAF50; font-weight: bold; }
          .tardanza { color: #FF9800; font-weight: bold; }
          .ausente { color: #F44336; font-weight: bold; }
          .justificado { color: #2196F3; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE ASISTENCIAS</h1>
          <p>DanzApp</p>
        </div>

        <div class="info">
          <p><strong>Fecha:</strong> ${dateStr}</p>
          <p><strong>Elenco:</strong> ${elencoName}</p>
          <p><strong>Estado:</strong> ${STATUS_OPTIONS.find(s => s.id === selectedStatus)?.label}</p>
        </div>

        <h2>ESTADÍSTICAS</h2>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.presente}</div>
            <div class="stat-label">Presentes (${percentage}%)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.tardanza}</div>
            <div class="stat-label">Tardanzas</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.ausente}</div>
            <div class="stat-label">Ausentes</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.justificado}</div>
            <div class="stat-label">Justificados</div>
          </div>
        </div>

        <h2>DETALLE</h2>
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Elenco</th>
              <th>Hora</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords.map(record => `
              <tr>
                <td>${record.estudiante_nombre}</td>
                <td>${record.elenco_nombre}</td>
                <td>${record.hora_inicio || '-'}</td>
                <td class="${record.estado}">${record.estado.toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
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
          <Text style={styles.headerTitle(theme)}>Historial</Text>
          <Text style={styles.headerSubtitle(theme)}>Registros de asistencia</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>Filtros</Text>
          
          {/* Date Picker */}
          <TouchableOpacity
            style={styles.dateButton(theme)}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={styles.dateButtonText(theme)}>
              {date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Elenco Filter */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.elencoChip(theme),
                !selectedElenco && styles.elencoChipActive(theme),
              ]}
              onPress={() => setSelectedElenco(null)}
            >
              <Text style={styles.elencoChipText(theme, !selectedElenco)}>
                Todos
              </Text>
            </TouchableOpacity>
            {elencos.map((elenco) => (
              <TouchableOpacity
                key={elenco.id}
                style={[
                  styles.elencoChip(theme),
                  selectedElenco === elenco.id && styles.elencoChipActive(theme),
                ]}
                onPress={() => setSelectedElenco(elenco.id)}
              >
                <Text style={styles.elencoChipText(theme, selectedElenco === elenco.id)}>
                  {elenco.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Status Filter */}
          <View style={styles.filterRow}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.statusChip(theme),
                  selectedStatus === status.id && styles.statusChipActive(theme, status.color),
                ]}
                onPress={() => setSelectedStatus(status.id)}
              >
                <Text style={styles.statusChipText(theme, selectedStatus === status.id)}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>Estadísticas</Text>
          <Card>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue(theme)}>{stats.total}</Text>
                <Text style={styles.statLabel(theme)}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue(theme), { color: '#4CAF50' }]}>
                  {stats.total > 0 ? ((stats.presente / stats.total) * 100).toFixed(0) : 0}%
                </Text>
                <Text style={styles.statLabel(theme)}>Asistencia</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Records List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>
            Registros ({filteredRecords.length})
          </Text>

          {loading ? (
            <Card>
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText(theme)}>Cargando registros...</Text>
              </View>
            </Card>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <Card key={record.id}>
                <View style={styles.recordItem}>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordName(theme)}>
                      {record.estudiante_nombre}
                    </Text>
                    <Text style={styles.recordElenco(theme)}>
                      {record.elenco_nombre}
                    </Text>
                    {record.hora_inicio && (
                      <Text style={styles.recordTime(theme)}>
                        {record.hora_inicio}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_OPTIONS.find(s => s.id === record.estado)?.color + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText(theme),
                      { color: STATUS_OPTIONS.find(s => s.id === record.estado)?.color }
                    ]}>
                      {record.estado}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <View style={styles.centerContent}>
                <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText(theme)}>
                  No hay registros para esta fecha
                </Text>
              </View>
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* PDF Export FAB */}
      {filteredRecords.length > 0 && (
        <TouchableOpacity
          style={styles.fab(theme)}
          onPress={generatePDF}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text" size={28} color={theme.colors.card} />
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
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: (theme) => ({
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  }),
  dateButton: (theme) => ({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    ...theme.shadows.small,
  }),
  dateButtonText: (theme) => ({
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    textTransform: 'capitalize',
  }),
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  elencoChip: (theme) => ({
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }),
  elencoChipActive: (theme) => ({
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  }),
  elencoChipText: (theme, active) => ({
    fontSize: 13,
    fontWeight: '600',
    color: active ? theme.colors.card : theme.colors.text,
  }),
  statusChip: (theme) => ({
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }),
  statusChipActive: (theme, color) => ({
    backgroundColor: color,
    borderColor: color,
  }),
  statusChipText: (theme, active) => ({
    fontSize: 12,
    fontWeight: '600',
    color: active ? '#FFFFFF' : theme.colors.text,
  }),
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: (theme) => ({
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  }),
  statLabel: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  }),
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: (theme) => ({
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  recordElenco: (theme) => ({
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  recordTime: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: (theme) => ({
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  }),
  centerContent: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: (theme) => ({
    fontSize: 14,
    color: theme.colors.textSecondary,
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
