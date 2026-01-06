// Student Payment Screen
// Manage payments for a specific student

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../theme';
import { Card } from '../components/Card';
import { PaymentRegistrationModal } from '../components/PaymentRegistrationModal';
import { CreateMensualidadModal } from '../components/CreateMensualidadModal';
import { MensualidadService } from '../../services/MensualidadService';

export const StudentPaymentScreen = ({ route, navigation }) => {
  const { student } = route.params;
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const [mensualidades, setMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMensualidad, setSelectedMensualidad] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadMensualidades();
  }, []);

  const loadMensualidades = async () => {
    try {
      setLoading(true);
      const result = await MensualidadService.getByStudent(student.id);
      if (result.success) {
        setMensualidades(result.data);
      }
    } catch (error) {
      console.error('Error loading mensualidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (paymentData) => {
    try {
      const result = await MensualidadService.registerPayment(
        selectedMensualidad.id,
        paymentData.monto,
        paymentData.metodoPago,
        paymentData.observaciones
      );

      if (result.success) {
        Alert.alert('Éxito', 'Pago registrado correctamente');
        setShowPaymentModal(false);
        loadMensualidades();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el pago');
    }
  };

  const handleCreateMensualidad = async (mensualidadData) => {
    try {
      const result = await MensualidadService.create(mensualidadData);

      if (result.success) {
        Alert.alert('Éxito', 'Mensualidad creada correctamente');
        setShowCreateModal(false);
        loadMensualidades();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la mensualidad');
    }
  };

  const getPaymentStatus = () => {
    const pendientes = mensualidades.filter(m => m.estado !== 'pagado');
    if (pendientes.length === 0) return { text: 'Al día', color: theme.colors.success };
    const vencidos = pendientes.filter(m => m.isVencido());
    if (vencidos.length > 0) return { text: 'Vencido', color: theme.colors.error };
    return { text: 'Pendiente', color: theme.colors.warning };
  };

  const status = getPaymentStatus();

  return (
    <SafeAreaView style={styles.container(theme)} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton(theme)}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle(theme)}>{student.getNombreCompleto()}</Text>
          <Text style={styles.headerSubtitle(theme)}>Gestión de Pagos</Text>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.section}>
        <Card>
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel(theme)}>Estado de Pagos</Text>
              <Text style={[styles.statusValue, { color: status.color }]}>{status.text}</Text>
            </View>
            <Ionicons 
              name={status.text === 'Al día' ? 'checkmark-circle' : 'alert-circle'} 
              size={48} 
              color={status.color} 
            />
          </View>
        </Card>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle(theme)}>Mensualidades</Text>

          {loading ? (
            <Card>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </Card>
          ) : mensualidades.length > 0 ? (
            mensualidades.map((mensualidad) => (
              <Card key={mensualidad.id}>
                <View style={styles.mensualidadCard}>
                  <View style={styles.mensualidadHeader}>
                    <Text style={styles.mensualidadPeriodo(theme)}>
                      {mensualidad.getPeriodoDisplay()}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: mensualidad.getStatusColor() + '20' }
                    ]}>
                      <Text style={[styles.statusBadgeText, { color: mensualidad.getStatusColor() }]}>
                        {mensualidad.getStatusText()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.mensualidadBody}>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel(theme)}>Monto Total:</Text>
                      <Text style={styles.amountValue(theme)}>Bs. {mensualidad.monto_total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel(theme)}>Pagado:</Text>
                      <Text style={[styles.amountValue(theme), { color: theme.colors.success }]}>
                        Bs. {mensualidad.monto_pagado.toFixed(2)}
                      </Text>
                    </View>
                    {mensualidad.getMontoRestante() > 0 && (
                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel(theme)}>Saldo:</Text>
                        <Text style={[styles.amountValue(theme), { color: theme.colors.error }]}>
                          Bs. {mensualidad.getMontoRestante().toFixed(2)}
                        </Text>
                      </View>
                    )}
                    {mensualidad.fecha_vencimiento && (
                      <Text style={styles.dueDate(theme)}>
                        Vence: {new Date(mensualidad.fecha_vencimiento).toLocaleDateString('es-ES')}
                      </Text>
                    )}
                  </View>

                  {mensualidad.estado !== 'pagado' && (
                    <TouchableOpacity
                      style={styles.payButton(theme)}
                      onPress={() => {
                        setSelectedMensualidad(mensualidad);
                        setShowPaymentModal(true);
                      }}
                    >
                      <Ionicons name="cash" size={20} color={theme.colors.card} />
                      <Text style={styles.payButtonText(theme)}>Registrar Pago</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText(theme)}>No hay mensualidades registradas</Text>
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB - Create Mensualidad */}
      <TouchableOpacity
        style={styles.fab(theme)}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={theme.colors.card} />
      </TouchableOpacity>

      {/* Payment Modal */}
      <PaymentRegistrationModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        mensualidad={selectedMensualidad}
        onPaymentRegistered={handleRegisterPayment}
        theme={theme}
      />

      {/* Create Mensualidad Modal */}
      <CreateMensualidadModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        student={student}
        onMensualidadCreated={handleCreateMensualidad}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: (theme) => ({ flex: 1, backgroundColor: theme.colors.background }),
  scrollView: { flex: 1 },
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
  headerContent: { flex: 1 },
  headerTitle: (theme) => ({ fontSize: 20, fontWeight: '700', color: theme.colors.text }),
  headerSubtitle: (theme) => ({ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }),
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: (theme) => ({ fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 12 }),
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusInfo: { flex: 1 },
  statusLabel: (theme) => ({ fontSize: 14, color: theme.colors.textSecondary }),
  statusValue: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  mensualidadCard: { gap: 12 },
  mensualidadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mensualidadPeriodo: (theme) => ({ fontSize: 16, fontWeight: '700', color: theme.colors.text }),
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  mensualidadBody: { gap: 8 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountLabel: (theme) => ({ fontSize: 14, color: theme.colors.textSecondary }),
  amountValue: (theme) => ({ fontSize: 14, fontWeight: '600', color: theme.colors.text }),
  dueDate: (theme) => ({ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }),
  payButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  }),
  payButtonText: (theme) => ({ fontSize: 14, fontWeight: '600', color: theme.colors.card }),
  emptyText: (theme) => ({ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 20 }),
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
