import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DownloadYawScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(async () => {
      await AsyncStorage.setItem('downloadShown', 'true');
      navigation.navigate('Home');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    // <ImageBackground
    //      source={require("../assets/SplashScreen_BG.png")}
    //      style={styles.imageBackground}
    //      resizeMode='cover'
    // >
    <View style={styles.container}>
        <Text style={styles.title}>Downloading</Text>
        <Text style={styles.title}>Yaw System...</Text>
      <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
    </View>
    // </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f3144',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontFamily: 'vestas-sans-Book',
    marginBottom: 20,
    textAlign: 'left'
  },
  loader: {
    marginTop: 20,
  },
});

export default DownloadYawScreen;
