// StatCard Component
// Specialized card for displaying statistics

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../theme';

export const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const iconColor = color || theme.colors.primary;

  return (
    <View style={[styles.card(theme)]}>
      <View style={styles.iconContainer(theme, iconColor)}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title(theme)}>{title}</Text>
        <Text style={styles.value(theme)}>{value}</Text>
        {subtitle && <Text style={styles.subtitle(theme)}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = {
  card: (theme) => ({
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
  }),
  iconContainer: (theme, color) => ({
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: color + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  }),
  content: {
    flex: 1,
  },
  title: (theme) => ({
    fontSize: theme.typography.fontSizeSmall,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  }),
  value: (theme) => ({
    fontSize: theme.typography.fontSizeXLarge,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  }),
  subtitle: (theme) => ({
    fontSize: theme.typography.fontSizeSmall,
    color: theme.colors.textLight,
    marginTop: 2,
  }),
};
