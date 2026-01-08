import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '../../components/AnimatedBackground';
import { getTheme } from '../../../theme';

const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const styles = makeStyles(theme);

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          
          {/* Top Card Image Area */}
          <View style={styles.cardContainer}>
            <Image 
              source={require('../../../assets/images/IMG_8025.jpg')} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Gestión Pro</Text>
            <Text style={styles.subheader}>Tu academia, al siguiente nivel</Text>
            <Text style={styles.description}>
              Descubre la forma más eficiente de administrar tus clases, estudiantes y pagos en un solo lugar.
            </Text>
          </View>

          {/* Bottom Toggle Buttons */}
          <View style={styles.bottomContainer}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={styles.toggleButtonLeft} 
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.toggleText}>Registrarse</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toggleButtonRight} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.toggleTextActive}>Ingresar</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  cardContainer: {
    marginTop: 20,
    height: '45%',
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface, // Adaptive surface color
    borderWidth: 1,
    borderColor: theme.colors.border, // Adaptive border
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontStyle: 'italic',
  },
  textContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text, // Adaptive text
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.colors.text, // Adaptive text
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary, // Adaptive secondary text
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  bottomContainer: {
    width: '100%',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface, // Adaptive pill background
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 6,
  },
  toggleButtonLeft: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary, // Primary color for active button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 4,
  },
  toggleButtonRight: {
    flex: 1,
    borderRadius: 30, // Fully rounded
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    // Transparent / Inactive style
  },
  toggleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF', // White text on Primary button
  },
  toggleTextActive: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text, // Adaptive text on transparent button
  },
});
