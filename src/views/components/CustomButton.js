import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { getTheme } from '../../theme';

export const CustomButton = ({
  title,
  onPress,
  type = 'primary', // 'primary' | 'secondary' | 'outline' | 'text'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const styles = makeStyles(theme);

  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === 'outline' || type === 'text' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.xl,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingHorizontal: theme.spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.typography.fontSizeMedium,
    fontWeight: theme.typography.fontWeightBold,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: theme.colors.primary,
  },
  textButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizeRegular,
  },
});
