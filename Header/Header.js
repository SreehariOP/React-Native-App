import React, { useContext }  from 'react';
import { View, Text, StyleSheet,  Image, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from "../Shared/languageContext";

const Header = ({navigation }) => {
  // const navigation = useNavigation();
  const { labels } = useContext(LanguageContext);

  const backOnClick = () =>{
    navigation.navigate('ActivityScreen');
  };

  return (
    <View>
      <View>
        {/* <Text style={styles.headText01}>Welcome!</Text> */}
        {/* <Text style={styles.headText02}>{labels.header.headerTitle}</Text> */}
        {/* <TouchableOpacity onPress={() => backOnClick()}>
          <Image source={require('../assets/back_Icon.png')}  resizeMode="contain" />
        </TouchableOpacity> */}
      </View> 
    </View>
  )
};

const styles = StyleSheet.create({
 headerContainer: {
   padding: 10,
   justifyContent:"center",
   backgroundColor: '#4ba6f7',
   height: 60
 },
 headText01: {
   color: '#fff',
   textAlign: 'center',
   marginTop: 15,
   fontFamily: 'vestas-sans-medium',
   fontSize: 30,
   letterSpacing: 1
 },
 headText02: {
  color: '#fff',
  textAlign: 'center',
  marginTop: 10,
  fontFamily: 'vestas-sans-medium',
  fontSize: 25,
  letterSpacing: .5
},
 headerImage:{
    width: 100
  },
  mainHeading: {
    fontSize: 20,
    // fontWeight: 600,
    marginBottom: 5,
    marginLeft: 15,
  }
});
export default Header;