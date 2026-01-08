import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomAlert } from '../src/views/components/CustomAlert';

// Mock CustomButton so we can easily assert rendered buttons and fire presses
jest.mock('../src/views/components/CustomButton', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');

  const MockCustomButton = ({ title, onPress, ...rest }) => (
    <TouchableOpacity testID={`custom-button-${title}`} onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );

  return { CustomButton: MockCustomButton };
});

describe('CustomAlert', () => {
  it('renders title, message and provided buttons when visible', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { getByText, getByTestId, queryByTestId } = render(
      <CustomAlert
        visible={true}
        title="My Title"
        message="My message"
        onClose={onClose}
        buttons={[
          { text: 'Confirm', onPress: onConfirm },
          { text: 'Cancel', onPress: onCancel },
        ]}
      />
    );

    expect(getByText('My Title')).toBeTruthy();
    expect(getByText('My message')).toBeTruthy();

    const confirmButton = getByTestId('custom-button-Confirm');
    const cancelButton = getByTestId('custom-button-Cancel');

    fireEvent.press(confirmButton);
    fireEvent.press(cancelButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);

    // The modal should be visible when visible=true
    expect(queryByTestId('custom-button-Confirm')).not.toBeNull();
  });

  it('renders a default OK button when no buttons are provided', () => {
    const onClose = jest.fn();

    const { getByText, getByTestId } = render(
      <CustomAlert
        visible={true}
        title="Default Button Title"
        message="Default message"
        onClose={onClose}
      />
    );

    const okButton = getByTestId('custom-button-OK');
    expect(okButton).toBeTruthy();

    fireEvent.press(okButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    expect(getByText('Default Button Title')).toBeTruthy();
    expect(getByText('Default message')).toBeTruthy();
  });
});
