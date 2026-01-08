import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../src/views/screens/autenticacion/RegisterScreen';

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

// Mock AnimatedBackground and CustomInput/CustomButton
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
const signUpMock = jest.fn();

jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args) => signUpMock(...args),
    },
  },
}));

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => {
  return jest.fn(() => 'light');
});

describe('RegisterScreen handleRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows alert when fields are empty', () => {
    const navigation = createNavigation();

    const { getByTestId } = render(<RegisterScreen navigation={navigation} />);

    const registerButton = getByTestId('button-Registrarse');

    fireEvent.press(registerButton);

    expect(showAlertMock).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Por favor completa todos los campos',
    });
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it('shows alert when passwords do not match', () => {
    const navigation = createNavigation();

    const { getByTestId } = render(<RegisterScreen navigation={navigation} />);

    const fullNameInput = getByTestId('input-Nombre Completo');
    const emailInput = getByTestId('input-Correo Electrónico');
    const passwordInput = getByTestId('input-Contraseña');
    const confirmPasswordInput = getByTestId('input-Confirmar Contraseña');
    const registerButton = getByTestId('button-Registrarse');

    fireEvent.changeText(fullNameInput, 'User Test');
    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password1');
    fireEvent.changeText(confirmPasswordInput, 'password2');

    fireEvent.press(registerButton);

    expect(showAlertMock).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Las contraseñas no coinciden',
    });
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it('calls supabase and shows success alert when form is valid', async () => {
    const navigation = createNavigation();

    signUpMock.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const { getByTestId } = render(<RegisterScreen navigation={navigation} />);

    const fullNameInput = getByTestId('input-Nombre Completo');
    const emailInput = getByTestId('input-Correo Electrónico');
    const passwordInput = getByTestId('input-Contraseña');
    const confirmPasswordInput = getByTestId('input-Confirmar Contraseña');
    const registerButton = getByTestId('button-Registrarse');

    fireEvent.changeText(fullNameInput, 'User Test');
    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledTimes(1);
    });

    expect(showAlertMock).toHaveBeenCalledWith({
      title: 'Registro Exitoso',
      message: 'Tu cuenta ha sido creada. Por favor verifica tu correo electrónico.',
      buttons: [{ text: 'OK', onPress: expect.any(Function) }],
    });
  });
});
