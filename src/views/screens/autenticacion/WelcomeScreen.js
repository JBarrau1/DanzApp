import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F478" />
      
      {/* Title Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          Bienvenido a:
        </Text>
        {/* Logo added as requested */}
        <Image 
          source={require('../../../assets/images/Logos_DanzApp_sfn.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../../assets/images/modelo_bienv.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Footer / Buttons */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F478', // Light yellow/lime background
    paddingHorizontal: 24,
  },
  headerContainer: {
    flex: 0.55, // Increased from 0.3 to fit large logo + text
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  title: {
    fontSize: 32, // Slightly smaller to ensure fit
    fontWeight: '900', // Maximum bold
    color: '#000000',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  logo: {
    marginTop: -100, // Pull closer to text
    width: 350,
    height: 350, // User's requested size
    alignSelf: 'center',
  },
  imageContainer: {
    flex: 0.45, // Reduced from 0.5
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginTop: -120, // Move image up
    width: '180%',
    height: '180%',
  },
  footerContainer: {
    flex: 0.2,
    flexDirection: 'row', // Horizontal layout
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 15,
  },
  button: {
    flex: 1, // Share space equally
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F2F478', // Yellow text
  },
});
