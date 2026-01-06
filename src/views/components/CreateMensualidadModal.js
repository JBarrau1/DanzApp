// Create Mensualidad Modal
// Modal to create new monthly payment for a student

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CreateMensualidadModal = ({ visible, onClose, student, onMensualidadCreated, theme }) => {
  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [anio, setAnio] = useState(currentDate.getFullYear());
  const [montoTotal, setMontoTotal] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    const monto = parseFloat(montoTotal);

    if (!montoTotal || isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    onMensualidadCreated({
      estudiante_id: student.id,
      mes,
      anio,
      monto_total: monto,
      monto_pagado: 0,
      descuento: 0,
      estado: 'pendiente',
      fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
      observaciones,
    });

    // Reset form
    setMontoTotal('');
    setObservaciones('');
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFechaVencimiento(selectedDate);
    }
  };

  if (!student) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent(theme)}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title(theme)}>Nueva Mensualidad</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Student Info */}
            <View style={styles.infoCard(theme)}>
              <Text style={styles.infoLabel(theme)}>Estudiante</Text>
              <Text style={styles.infoValue(theme)}>{student.getNombreCompleto?.() || student.nombres}</Text>
            </View>

            {/* Mes */}
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Mes *</Text>
              <View style={styles.monthGrid}>
                {MONTHS.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthButton(theme),
                      mes === index + 1 && styles.monthButtonActive(theme),
                    ]}
                    onPress={() => setMes(index + 1)}
                  >
                    <Text style={[
                      styles.monthText(theme),
                      mes === index + 1 && { color: theme.colors.card }
                    ]}>
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Año */}
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Año *</Text>
              <View style={styles.yearRow}>
                <TouchableOpacity
                  style={styles.yearButton(theme)}
                  onPress={() => setAnio(anio - 1)}
                >
                  <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.yearText(theme)}>{anio}</Text>
                <TouchableOpacity
                  style={styles.yearButton(theme)}
                  onPress={() => setAnio(anio + 1)}
                >
                  <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Monto Total */}
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Monto Total (Bs.) *</Text>
              <TextInput
                style={styles.input(theme)}
                value={montoTotal}
                onChangeText={setMontoTotal}
                placeholder="200.00"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Fecha de Vencimiento */}
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Fecha de Vencimiento *</Text>
              <TouchableOpacity
                style={styles.dateButton(theme)}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.dateButtonText(theme)}>
                  {fechaVencimiento.toLocaleDateString('es-ES')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={fechaVencimiento}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Observaciones */}
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Observaciones</Text>
              <TextInput
                style={[styles.input(theme), styles.textArea]}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Opcional"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitButton(theme)}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color={theme.colors.card} />
                  <Text style={styles.submitButtonText(theme)}>Crear Mensualidad</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: (theme) => ({
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  }),
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: (theme) => ({
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  }),
  body: {
    padding: 20,
  },
  infoCard: (theme) => ({
    backgroundColor: theme.colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  }),
  infoLabel: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
  }),
  infoValue: (theme) => ({
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 4,
  }),
  formGroup: {
    marginBottom: 20,
  },
  label: (theme) => ({
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  }),
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthButton: (theme) => ({
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: '22%',
    alignItems: 'center',
  }),
  monthButtonActive: (theme) => ({
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  }),
  monthText: (theme) => ({
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  yearButton: (theme) => ({
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  yearText: (theme) => ({
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
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
  dateButton: (theme) => ({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  }),
  dateButtonText: (theme) => ({
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  }),
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  submitButton: (theme) => ({
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }),
  submitButtonText: (theme) => ({
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.card,
  }),
};
