import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, useColorScheme, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const AnimatedBackground = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const moveAnim1 = useRef(new Animated.Value(0)).current;
  const moveAnim2 = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    // Movement Animation 1 (Circle 1)
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim1, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim1, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Movement Animation 2 (Circle 2)
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim2, {
          toValue: 1,
          duration: 12000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim2, {
          toValue: 0,
          duration: 12000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Theme-based static background
  const backgroundColor = isDark ? '#121212' : '#FFFFFF';

  // Gradient colors for blobs (Green/Teal variations)
  // Light Mode: Subtle pastel greens
  // Dark Mode: Deep forest greens with low opacity
  const blobGradient1 = isDark 
    ? ['rgba(89, 120, 112, 0.4)', 'rgba(74, 102, 95, 0.1)'] 
    : ['rgba(89, 120, 112, 0.2)', 'rgba(164, 235, 214, 0.05)'];

  const blobGradient2 = isDark 
    ? ['rgba(44, 62, 58, 0.4)', 'rgba(89, 120, 112, 0.1)'] 
    : ['rgba(52, 235, 189, 0.15)', 'rgba(89, 120, 112, 0.05)'];

  const translate1 = moveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const translate2 = moveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Decorative Moving Blobs with Gradients */}
      <Animated.View 
        style={[
          styles.blob, 
          styles.blob1, 
          { 
            transform: [{ translateY: translate1 }, { translateX: translate1 }] 
          }
        ]} 
      >
        <LinearGradient
          colors={blobGradient1}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.blob, 
          styles.blob2, 
          { 
            transform: [{ translateY: translate2 }, { scale: 1.2 }] 
          }
        ]} 
      >
        <LinearGradient
          colors={blobGradient2}
          style={styles.gradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.2,
    overflow: 'hidden',
  },
  blob2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.4,
    right: -width * 0.4,
    overflow: 'hidden', // Ensure gradient is clipped to blob shape
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
