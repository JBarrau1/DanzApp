// Card Component
// Reusable card component with theme support

import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../../theme';

export const Card = ({ children, style }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');

  return (
    <View style={[styles.card(theme), style]}>
      {children}
    </View>
  );
};

const styles = {
  card: (theme) => ({
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.small,
  }),
};
