import React, { createContext, useState, useContext, useCallback } from 'react';
import { CustomAlert } from '../views/components/CustomAlert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback(({ title, message, buttons = [] }) => {
    setConfig({ title, message, buttons });
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleClose = () => {
    hideAlert();
  };

  // Intercept button presses to close alert automatically if desired, 
  // or let the caller handle it. Here we wrap them to ensure close behavior
  // if no specific logic dictates otherwise, or just pass verify close calls.
  // For simplicity, we'll pass hideAlert to the button actions if they don't exist?
  // Actually, standard Alert.alert behavior is: pressing a button closes it.
  
  const processedButtons = config.buttons.map(btn => ({
    ...btn,
    onPress: () => {
      if (btn.onPress) btn.onPress();
      hideAlert();
    }
  }));

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={visible}
        title={config.title}
        message={config.message}
        buttons={processedButtons.length ? processedButtons : [{ text: 'OK', onPress: hideAlert }]}
        onClose={handleClose}
      />
    </AlertContext.Provider>
  );
};
