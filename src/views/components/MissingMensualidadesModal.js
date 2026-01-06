// Missing Mensualidades Alert Modal
// Shows alert when there are missing mensualidades to generate

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const MissingMensualidadesModal = ({ 
  visible, 
  onClose, 
  missingData, 
  onGenerateAll, 
  loading,
  theme 
}) => {
  if (!missingData || missingData.length === 0) return null;

  const totalMissing = missingData.reduce((sum, item) => sum + item.missing.length, 0);
  const totalStudents = missingData.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent(theme)}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer(theme)}>
              <Ionicons name="alert-circle" size={48} color={theme.colors.warning} />
            </View>
            <Text style={styles.title(theme)}>Mensualidades Pendientes</Text>
            <Text style={styles.subtitle(theme)}>
              Se detectaron {totalMissing} mensualidades faltantes para {totalStudents} estudiante{totalStudents > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Student List */}
          <ScrollView style={styles.body}>
            {missingData.map((item, index) => (
              <View key={item.student.id} style={styles.studentItem(theme)}>
                <View style={styles.studentHeader}>
                  <Ionicons name="person" size={20} color={theme.colors.primary} />
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName(theme)}>{item.student.nombre}</Text>
                    <Text style={styles.studentElenco(theme)}>{item.student.elenco}</Text>
                  </View>
                  <View style={styles.badge(theme)}>
                    <Text style={styles.badgeText(theme)}>{item.missing.length}</Text>
                  </View>
                </View>
                <View style={styles.missingList}>
                  {item.missing.slice(0, 3).map((m, i) => (
                    <Text key={i} style={styles.missingText(theme)}>
                      • {getMonthName(m.mes)} {m.anio}
                    </Text>
                  ))}
                  {item.missing.length > 3 && (
                    <Text style={styles.moreText(theme)}>
                      +{item.missing.length - 3} más...
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.secondaryButton(theme)}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText(theme)}>Más Tarde</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton(theme)}
              onPress={onGenerateAll}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <>
                  <Ionicons name="flash" size={20} color={theme.colors.card} />
                  <Text style={styles.primaryButtonText(theme)}>Generar Todas</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getMonthName = (month) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || '';
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: (theme) => ({
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  }),
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: (theme) => ({
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.warning + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  }),
  title: (theme) => ({
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  }),
  subtitle: (theme) => ({
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  }),
  body: {
    maxHeight: 300,
    padding: 20,
  },
  studentItem: (theme) => ({
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  }),
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: (theme) => ({
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  studentElenco: (theme) => ({
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  badge: (theme) => ({
    backgroundColor: theme.colors.warning,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  }),
  badgeText: (theme) => ({
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.card,
  }),
  missingList: {
    gap: 4,
  },
  missingText: (theme) => ({
    fontSize: 13,
    color: theme.colors.textSecondary,
  }),
  moreText: (theme) => ({
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  }),
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  secondaryButton: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  }),
  secondaryButtonText: (theme) => ({
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  primaryButton: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }),
  primaryButtonText: (theme) => ({
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.card,
  }),
};
