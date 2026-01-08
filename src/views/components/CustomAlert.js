import React from 'react';
import { Modal, View, Text, StyleSheet, useColorScheme, TouchableWithoutFeedback } from 'react-native';
import { getTheme } from '../../theme';
import { CustomButton } from './CustomButton';

export const CustomAlert = ({
  visible,
  title,
  message,
  buttons = [], // [{ text, onPress, type, style }]
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const styles = makeStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {message && <Text style={styles.message}>{message}</Text>}

              <View style={styles.buttonContainer}>
                {buttons.length > 0 ? (
                  buttons.map((btn, index) => (
                    <View key={index} style={styles.buttonWrapper}>
                      <CustomButton
                        title={btn.text}
                        onPress={() => {
                          if (btn.onPress) btn.onPress();
                        }}
                        type={btn.type || 'primary'}
                        style={{ 
                          width: 'auto', 
                          height: 40,
                          paddingHorizontal: theme.spacing.lg, 
                          ...btn.style 
                        }} 
                      />
                    </View>
                  ))
                ) : (
                  <View style={styles.buttonWrapper}>
                    <CustomButton 
                      title="OK" 
                      onPress={onClose} 
                      style={{ 
                        width: 'auto', 
                        height: 40,
                        paddingHorizontal: theme.spacing.lg 
                      }}
                    />
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  alertContainer: {
    backgroundColor: theme.colors.background || '#FFFFFF',
    borderRadius: theme.borderRadius.xl, // Using the rounded XL radius as requested
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadows.large,
  },
  title: {
    fontSize: theme.typography.fontSizeLarge,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text || '#000000',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.fontSizeMedium,
    color: theme.colors.textSecondary || '#666666',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md, // Use gap for spacing between buttons
    flexWrap: 'wrap',
  },
  buttonWrapper: {
    // Removed width: '100%' so it takes content size
    minWidth: 100, // Minimum width for look
  },
  // buttonSpacer removed as we use gap
});
