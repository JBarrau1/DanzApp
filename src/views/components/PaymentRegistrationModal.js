// Payment Registration Modal
// Modal to register payments for a mensualidad

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

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: 'cash' },
  { id: 'transferencia', label: 'Transferencia', icon: 'card' },
  { id: 'qr', label: 'QR', icon: 'qr-code' },
];

export const PaymentRegistrationModal = ({ visible, onClose, mensualidad, onPaymentRegistered, theme }) => {
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const saldoPendiente = mensualidad ? mensualidad.getMontoRestante() : 0;

  const handleSubmit = () => {
    const montoNum = parseFloat(monto);

    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    if (montoNum > saldoPendiente) {
      Alert.alert('Error', `El monto no puede exceder el saldo pendiente (Bs. ${saldoPendiente.toFixed(2)})`);
      return;
    }

    onPaymentRegistered({
      monto: montoNum,
      metodoPago,
      observaciones,
    });

    // Reset form
    setMonto('');
    setObservaciones('');
  };

  if (!mensualidad) return null;

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
            <Text style={styles.title(theme)}>Registrar Pago</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Mensualidad Info */}
            <View style={styles.infoCard(theme)}>
              <Text style={styles.infoLabel(theme)}>Mensualidad</Text>
              <Text style={styles.infoValue(theme)}>{mensualidad.getPeriodoDisplay()}</Text>
              <Text style={styles.infoLabel(theme)}>Saldo Pendiente</Text>
              <Text style={[styles.infoValue(theme), { color: theme.colors.primary, fontSize: 24 }]}>
                Bs. {saldoPendiente.toFixed(2)}
              </Text>
            </View>

            {/* Monto */}
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Monto a Pagar *</Text>
              <TextInput
                style={styles.input(theme)}
                value={monto}
                onChangeText={setMonto}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Método de Pago */}
            <View style={styles.formGroup}>
              <Text style={styles.label(theme)}>Método de Pago *</Text>
              <View style={styles.methodsRow}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodButton(theme),
                      metodoPago === method.id && styles.methodButtonActive(theme),
                    ]}
                    onPress={() => setMetodoPago(method.id)}
                  >
                    <Ionicons
                      name={method.icon}
                      size={24}
                      color={metodoPago === method.id ? theme.colors.card : theme.colors.text}
                    />
                    <Text style={[
                      styles.methodText(theme),
                      metodoPago === method.id && { color: theme.colors.card }
                    ]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.card} />
                  <Text style={styles.submitButtonText(theme)}>Registrar Pago</Text>
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
    maxHeight: '85%',
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
    marginTop: 8,
  }),
  infoValue: (theme) => ({
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
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
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodButton: (theme) => ({
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 4,
  }),
  methodButtonActive: (theme) => ({
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  }),
  methodText: (theme) => ({
    fontSize: 12,
    fontWeight: '600',
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
