import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import { useWindowDimensions } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLogOut, userData } from '../util/asyncUtils';

const VTPScreen = ({ navigation }) => {
  const [orientation, setOrientation] = useState('');
  const { width, height } = useWindowDimensions();
  useEffect(() => {
    const checkEmail = async () => {
      try {
        const asyncEmail = await userData();
        const logout = await getLogOut();
        if (asyncEmail && logout != true) {
          navigation.navigate('ActivityScreen');
        } else {
          navigation.navigate('LoginScreen', {initialStep: 1});
        }
      } catch (error) {
        console.error('Failed to get email from AsyncStorage:', error);
        navigation.navigate('LoginScreen', {initialStep: 1});
      }
    };

    const timer = setTimeout(() => {
      checkEmail();
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);
  

  useEffect(() => {
    if (width < height) {
      setOrientation("portrait")
    } else {
      setOrientation("landscape")
    }
    console.log(orientation);
  }, [width, height])

  return (
    <ImageBackground
         source={orientation === 'portrait' ? require("../assets/SplashScreen_BG.png") : require("../assets/landscape_banner.png")}
         style={styles.imageBackground}
         resizeMode='cover'
    >
    <View style={styles.container}>
      {/* <View style={styles.logoContainer}>
        <Image source={require('../assets/Vestas_Secondary_Logo_RGB_1.png')} style={styles.logo} />
      </View> */}
      {/* <View style={styles.textContainer}>
        <Text style={styles.title}>Virtual</Text>
        <Text style={styles.title}>Technician</Text>
        <Text style={styles.title}>Prototype</Text>
        <Text style={styles.title}>(VTP)</Text>
      </View> */}
      <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  logoContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: '80%',
    height: 60,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    marginRight: 50
  },
  title: {
    color: '#ffffff',
    fontSize: 40,
    fontFamily: 'vestas-sans-Book',
    textAlign: 'left',
  },
  loader: {
    marginTop: 20,
  },
});

export default VTPScreen;
