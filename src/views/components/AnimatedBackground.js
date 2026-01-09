import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, useColorScheme } from 'react-native';
import { 
  Canvas, 
  Circle, 
  LinearGradient, 
  vec, 
  // useComputedValue, <--- ELIMINADO
  BlurMask,
} from '@shopify/react-native-skia';
// Agregamos useDerivedValue aquí
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// Helper for interpolation
// IMPORTANTE: Agregamos 'worklet' para que funcione en el hilo de UI de Reanimated
const mix = (value, x, y) => {
  "worklet";
  return x + (y - x) * value;
}; 

export const AnimatedBackground = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values using Reanimated (0 to 1)
  const progress = useSharedValue(0);
  const breathing = useSharedValue(0);

  useEffect(() => {
    // Loop animation for circular movement (0 to 1, repeating)
    progress.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.linear }),
      -1, // infinite
      false // don't reverse
    );

    // Breathing animation (0 to 1, back and forth)
    breathing.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1, // infinite
      true // reverse (mirroring)
    );
  }, []);

  // --- CAMBIOS AQUÍ ---
  // Usamos useDerivedValue en lugar de useComputedValue
  
  const r1 = useDerivedValue(() => {
    return mix(breathing.value, width * 0.8, width * 0.9);
  });

  const r2 = useDerivedValue(() => {
    return mix(breathing.value, width * 0.7, width * 0.85);
  });
  
  const c1 = useDerivedValue(() => {
    // Moves in a slight ellipse/figure-8
    const theta = progress.value * 2 * Math.PI;
    const x = width * 0.2 + Math.cos(theta) * 50;
    const y = height * 0.2 + Math.sin(theta) * 80;
    return vec(x, y);
  });

  const c2 = useDerivedValue(() => {
    // Moves in counter-direction
    const theta = progress.value * 2 * Math.PI;
    const x = width * 0.8 - Math.cos(theta) * 60;
    const y = height * 0.6 - Math.sin(theta) * 50;
    return vec(x, y);
  });

  // Colors
  const colors1 = ["#FFEAB8", "#FFCE5C"]; // Cyan to Magenta
  const colors2 = ["#EBA300", "#FFF7E6"]; // Magenta to Purple

  // Background color based on theme
  const backgroundColor = isDark ? '#000000' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Circle 1 */}
        <Circle c={c1} r={r1}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, height)}
            colors={colors1}
          />
          <BlurMask blur={50} style="normal" />
        </Circle>

        {/* Circle 2 */}
        <Circle c={c2} r={r2}>
          <LinearGradient
            start={vec(width, 0)}
            end={vec(0, height)}
            colors={colors2}
          />
          <BlurMask blur={50} style="normal" />
        </Circle>
      </Canvas>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});