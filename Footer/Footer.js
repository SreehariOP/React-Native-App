import React, {useContext} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { LanguageContext } from "../Shared/languageContext"; 
import { NavigationContext } from '../Shared/NavigationContext';

const Footer = ({ navigation, onBack, onNext,onEsif,onNew, nextEnabled, backEnabled, esifEnabled, newEnabled }) => {
  const { labels } = useContext(LanguageContext);
  const {setSideBarConfig } = useContext(NavigationContext);
  return (
    <View style={styles.footerContainer}>
      <View style={styles.subContainer}>
        {/* <TouchableOpacity  onPress = {onEsif}>
          <Image source={require('../assets/e_sif.png')} resizeMode="contain" style={[esifEnabled ? styles.iconEnabled : styles.iconDisabled]} />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={backEnabled ? onBack : () => {}}>
          <Image source={require('../assets/fback.png')} resizeMode="contain" style={[backEnabled ? styles.iconEnabled : styles.iconDisabled]} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {navigation.navigate("LoginScreen", {initialStep: 3 }); setSideBarConfig('loginscreen')}}>
          <Image source={require('../assets/home_icon.png')} style={{width: 25}} resizeMode="contain"  />
        </TouchableOpacity>

        <TouchableOpacity onPress={nextEnabled ? onNext : () => {}}>
          <Image source={require('../assets/next.png')} resizeMode="contain" style={[nextEnabled ? styles.iconEnabled : styles.iconDisabled]} />
        </TouchableOpacity>
      </View>

      {/* Old Footer */}
      {/* <TouchableOpacity
        onPress={backEnabled ? onBack : {}}
        style={[
          styles.button,
          styles.leftButton,
          backEnabled ? styles.buttonEnabled : styles.buttonDisabled
        ]}
        disabled={!backEnabled}
      >
        <Text style={styles.buttonText}>{labels.footer.back}</Text>
      </TouchableOpacity>
      <View style={styles.space} />
      {esifEnabled ? (
        <TouchableOpacity
          onPress = {onEsif}
          style={[
            styles.button,
            styles.rightButton,
            esifEnabled ? styles.buttonEnabled : styles.buttonDisabled
          ]}
        >
           <Text style={styles.buttonText}>{labels.footer.esif}</Text>
        </TouchableOpacity>
      ): newEnabled ? (
      <TouchableOpacity
        onPress={onNew}
        style={[
          styles.button,
          styles.rightButton,
          newEnabled ? styles.buttonEnabled : styles.buttonDisabled
        ]}
        disabled={!nextEnabled}
      >
        <Text style={styles.buttonText}>{labels.footer.new}</Text>
      </TouchableOpacity>
      ):  (
        <TouchableOpacity
        onPress={nextEnabled ? onNext : () => {}}
        style={[
          styles.button,
          styles.rightButton,
          nextEnabled ? styles.buttonEnabled : styles.buttonDisabled
        ]}
        disabled={!nextEnabled}
      >
        <Text style={styles.buttonText}>{labels.footer.next}</Text>
      </TouchableOpacity>
      )} */}
      
    </View>
  );
};
const styles = StyleSheet.create({
  footerContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    height: 50,
    backgroundColor: "#4BA6F7",
    justifyContent: 'center',
    alignItems: 'center'
  },
  subContainer: {
    flexDirection: "row",
    alignItems:'center',
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    flex: 1,
    width: '100%',
    position: 'relative'
  },
  iconDisabled: {
    opacity: 0.5,
    pointerEvents: 'none'
  },
  iconEnabled: {
    opacity: 1,
  }

  // footerContainer: {
  //   flexDirection: "row",
  //   padding: 10,
  //   backgroundColor: "#fff",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: -2 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 5,
  //   elevation: 5,
  // },
  // button: {
  //   padding: 15,
  //   flex: 30,
  //   alignItems: "center",
  //   borderRadius: 50,
  //   height : 55
  // },
  // leftButton: {
  //   marginRight: 5,
  // },
  // rightButton: {
  //   marginLeft: 5,
  // },
  // buttonText: {
  //   color: "#fff",
  //   fontSize: 20,
  // },
  // buttonDisabled: {
  //   backgroundColor: "#b7dbfc",
  // },
  // buttonEnabled: {
  //   backgroundColor: "#4BA6F7",
  // },
  // space: {
  //   width: 10,
  //   flex: 1,
  // },
});
export default Footer;
