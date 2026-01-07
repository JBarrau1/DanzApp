import React from 'react';
import { StyleSheet, View, TextInput, Text, useColorScheme } from 'react-native';
import { getTheme } from '../../theme';

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  leftIcon,
  variant = 'default', // 'default' | 'glass'
}) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const styles = makeStyles(theme);
  
  const [isSecure, setIsSecure] = React.useState(secureTextEntry);

  const isGlass = variant === 'glass';
  const placeholderColor = isGlass ? 'rgba(255, 255, 255, 0.7)' : theme.colors.textSecondary;
  const inputStyle = isGlass ? styles.glassInput : styles.input;
  const inputContainerStyle = isGlass ? styles.glassInputContainer : styles.inputContainer;
  const errorStyle = isGlass ? styles.glassErrorText : styles.errorText;
  const labelStyle = isGlass ? styles.glassLabel : styles.label;

  return (
    <View style={styles.container}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <View style={[inputContainerStyle, error && styles.inputError]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.rightIcon}>
            <Ionicons 
              name={isSecure ? "eye-off" : "eye"} 
              size={20} 
              color={isGlass ? '#FFF' : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSizeRegular,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeightMedium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 50,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizeRegular,
  },
  glassInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: theme.typography.fontSizeRegular,
  },
  glassInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: theme.spacing.md,
    height: 50,
  },
  glassLabel: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSizeRegular,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeightMedium,
  },
  glassErrorText: {
    color: '#FFCDD2', // Light red for better visibility on dark bg
    fontSize: theme.typography.fontSizeSmall,
    marginTop: theme.spacing.xs,
    fontWeight: 'bold',
  },
  rightIcon: {
    padding: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizeSmall,
    marginTop: theme.spacing.xs,
  },
});
