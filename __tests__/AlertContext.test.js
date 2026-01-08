import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { AlertProvider, useAlert } from '../src/context/AlertContext';

// Mock CustomAlert to a simple visible block we can assert on.
jest.mock('../src/views/components/CustomAlert', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  const MockCustomAlert = ({ visible, title, message, buttons, onClose }) => {
    if (!visible) return null;
    return (
      <View testID="custom-alert">
        <Text testID="alert-title">{title}</Text>
        <Text testID="alert-message">{message}</Text>
        {buttons.map((btn, index) => (
          <TouchableOpacity
            key={index}
            testID={`alert-button-${index}`}
            onPress={btn.onPress}
          >
            <Text>{btn.text}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity testID="alert-overlay" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return { CustomAlert: MockCustomAlert };
});

const TestComponent = () => {
  const { showAlert, hideAlert } = useAlert();

  return (
    <>
      <TouchableOpacity
        testID="show-alert-btn"
        onPress={() =>
          showAlert({
            title: 'Test title',
            message: 'Test message',
            buttons: [{ text: 'OK' }],
          })
        }
      >
        <Text>Show</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="hide-alert-btn" onPress={hideAlert}>
        <Text>Hide</Text>
      </TouchableOpacity>
    </>
  );
};

describe('AlertProvider', () => {
  it('shows alert when showAlert is called and hides when hideAlert is called', () => {
    const { getByTestId, queryByTestId } = render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    // Initially no alert is visible
    expect(queryByTestId('custom-alert')).toBeNull();

    // Call showAlert via the test button
    fireEvent.press(getByTestId('show-alert-btn'));

    const alert = getByTestId('custom-alert');
    expect(alert).toBeTruthy();
    expect(getByTestId('alert-title').props.children).toBe('Test title');
    expect(getByTestId('alert-message').props.children).toBe('Test message');

    // Now hide via context hideAlert
    fireEvent.press(getByTestId('hide-alert-btn'));
    expect(queryByTestId('custom-alert')).toBeNull();
  });

  it('closes alert when button is pressed (processedButtons behavior)', () => {
    const { getByTestId, queryByTestId } = render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    fireEvent.press(getByTestId('show-alert-btn'));
    expect(getByTestId('custom-alert')).toBeTruthy();

    // This button comes from processedButtons in AlertProvider
    fireEvent.press(getByTestId('alert-button-0'));

    // After pressing any alert button, alert should be hidden
    expect(queryByTestId('custom-alert')).toBeNull();
  });
});
