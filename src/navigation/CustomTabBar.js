// Custom Tab Bar
// Modern floating tab bar with animations

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CustomTabBar = ({ state, descriptors, navigation, theme }) => {
  const insets = useSafeAreaInsets();
  const [animations] = React.useState(
    state.routes.map(() => new Animated.Value(1))
  );

  const handlePress = (route, index, isFocused) => {
    // Animate the pressed tab
    Animated.sequence([
      Animated.timing(animations[index], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const getIconName = (routeName, focused) => {
    if (routeName === 'Home') {
      return focused ? 'home' : 'home-outline';
    } else if (routeName === 'Asistencia') {
      return focused ? 'checkmark-circle' : 'checkmark-circle-outline';
    } else if (routeName === 'Mensualidades') {
      return focused ? 'cash' : 'cash-outline';
    }
    return 'help-circle-outline';
  };

  const getLabel = (routeName) => {
    if (routeName === 'Home') return 'Inicio';
    if (routeName === 'Asistencia') return 'Asistencia';
    if (routeName === 'Mensualidades') return 'Pagos';
    return routeName;
  };

  return (
    <View style={styles.container(insets)}>
      <View style={styles.tabBarContainer(theme)}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          return (
            <Animated.View
              key={route.key}
              style={[
                styles.tabItem,
                {
                  transform: [{ scale: animations[index] }],
                },
              ]}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={() => handlePress(route, index, isFocused)}
                style={[
                  styles.button,
                  isFocused && styles.buttonActive(theme),
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer(theme, isFocused)}>
                  <Ionicons
                    name={getIconName(route.name, isFocused)}
                    size={24}
                    color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                <Animated.Text
                  style={[
                    styles.label(theme),
                    isFocused && styles.labelActive(theme),
                  ]}
                >
                  {getLabel(route.name)}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = {
  container: (insets) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Math.max(insets.bottom, 8),
    paddingHorizontal: 16,
    paddingTop: 8,
  }),
  tabBarContainer: (theme) => ({
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: theme.isDark ? 0.4 : 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: theme.isDark ? theme.colors.border : 'rgba(0,0,0,0.05)',
  }),
  tabItem: {
    flex: 1,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  buttonActive: (theme) => ({
    backgroundColor: theme.colors.primary + '15',
  }),
  iconContainer: (theme, isFocused) => ({
    marginBottom: 2,
  }),
  label: (theme) => ({
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 2,
  }),
  labelActive: (theme) => ({
    color: theme.colors.primary,
    fontWeight: '700',
  }),
};
