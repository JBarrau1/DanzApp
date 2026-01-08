import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../src/views/screens/autenticacion/LoginScreen';

// Mock navigation prop
const createNavigation = () => ({
  goBack: jest.fn(),
  navigate: jest.fn(),
});

// Mock useAlert hook
const showAlertMock = jest.fn();

jest.mock('../src/context/AlertContext', () => ({
  useAlert: () => ({
    showAlert: showAlertMock,
  }),
}));

// Mock AnimatedBackground and CustomInput/CustomButton to keep the tree simple
jest.mock('../src/views/components/AnimatedBackground', () => ({
  AnimatedBackground: ({ children }) => children,
}));

jest.mock('../src/views/components/CustomInput', () => {
  const React = require('react');
  const { TextInput } = require('react-native');

  const MockCustomInput = ({ label, value, onChangeText, ...rest }) => (
    <TextInput
      testID={`input-${label}`}
      value={value}
      onChangeText={onChangeText}
    />
  );

  return { CustomInput: MockCustomInput };
});

jest.mock('../src/views/components/CustomButton', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');

  const MockCustomButton = ({ title, onPress, ...rest }) => (
    <TouchableOpacity testID={`button-${title}`} onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );

  return { CustomButton: MockCustomButton };
});

// Mock supabase
const signInWithPasswordMock = jest.fn();

jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args) => signInWithPasswordMock(...args),
    },
  },
}));

// Mock useColorScheme to avoid environment dependency
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => {
  return jest.fn(() => 'light');
});

describe('LoginScreen handleLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays alert on empty fields', async () => {
    const navigation = createNavigation();

    const { getByTestId } = render(<LoginScreen navigation={navigation} />);

    const submitButton = getByTestId('button-Ingresar');

    fireEvent.press(submitButton);

    expect(showAlertMock).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Por favor completa todos los campos.',
    });
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it('shows error alert on invalid credentials', async () => {
    const navigation = createNavigation();

    signInWithPasswordMock.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });

    const { getByTestId } = render(<LoginScreen navigation={navigation} />);

    const emailInput = getByTestId('input-Correo Electrónico');
    const passwordInput = getByTestId('input-Contraseña');
    const submitButton = getByTestId('button-Ingresar');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(signInWithPasswordMock).toHaveBeenCalledTimes(1);
    });

    expect(showAlertMock).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Correo o contraseña incorrectos.',
    });
  });
});
