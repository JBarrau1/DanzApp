// Elenco Card Component
// Beautiful card to display dance group information

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';

export const ElencoCard = ({ elenco, onPress, theme, studentCount = 0 }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card>
        <View style={styles.container}>
          {/* Header with icon */}
          <View style={styles.header}>
            <View style={styles.iconContainer(theme)}>
              <Ionicons name="people" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.nombre(theme)}>{elenco.nombre}</Text>
              {elenco.horario && (
                <View style={styles.horarioContainer}>
                  <Ionicons 
                    name="time-outline" 
                    size={14} 
                    color={theme.colors.textSecondary} 
                  />
                  <Text style={styles.horario(theme)} numberOfLines={2}>
                    {elenco.horario}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {elenco.descripcion && (
            <Text style={styles.descripcion(theme)} numberOfLines={2}>
              {elenco.descripcion}
            </Text>
          )}

          {/* Info Row */}
          <View style={styles.infoRow}>
            {/* Age Range */}
            {(elenco.edad_minima || elenco.edad_maxima) && (
              <View style={styles.infoBadge(theme)}>
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.infoBadgeText(theme)}>
                  {elenco.getAgeRangeDisplay()}
                </Text>
              </View>
            )}

            {/* Student Count */}
            <View style={styles.infoBadge(theme)}>
              <Ionicons 
                name="person" 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text style={styles.infoBadgeText(theme)}>
                {studentCount} {studentCount === 1 ? 'estudiante' : 'estudiantes'}
              </Text>
            </View>
          </View>

          {/* Active Status */}
          <View style={styles.footer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: elenco.activo ? theme.colors.success + '20' : theme.colors.error + '20' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: elenco.activo ? theme.colors.success : theme.colors.error }
              ]} />
              <Text style={[
                styles.statusText(theme),
                { color: elenco.activo ? theme.colors.success : theme.colors.error }
              ]}>
                {elenco.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>

            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: (theme) => ({
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  }),
  headerInfo: {
    flex: 1,
  },
  nombre: (theme) => ({
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  }),
  horarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  horario: (theme) => ({
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    flexWrap: 'wrap',
  }),
  descripcion: (theme) => ({
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  }),
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoBadge: (theme) => ({
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  }),
  infoBadgeText: (theme) => ({
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: (theme) => ({
    fontSize: 12,
    fontWeight: '600',
  }),
};
