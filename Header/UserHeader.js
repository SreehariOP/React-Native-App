import React, {useState, useEffect, useContext} from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Tooltip from 'react-native-walkthrough-tooltip';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userData } from "../util/asyncUtils";
import { NavigationContext } from '../Shared/NavigationContext';
import { LanguageContext } from "../Shared/languageContext"; 
import { Dropdown } from 'react-native-element-dropdown';


const UserHeader = ({ navigation, title, subTitle, backButton = false, homeButton = true, backScreen = "", onPressBack , isShowSlide = true, backScreenParams, showLanguageDropdown = false,onMenuPress, onLanguagePress, selectedLanguageLabel}) => {
  const [initials, setInitials] = useState('');
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const {setSideBarConfig } = useContext(NavigationContext);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { selectedLanguage } = useContext(LanguageContext);
  const handleMenuPress = () => {
    if(onMenuPress) onMenuPress();
    navigation.openDrawer();
  };

  const backOnClick = () =>{
    if (onPressBack) {
      onPressBack();
    }else if (backScreen){
      navigation.navigate(backScreen,backScreenParams)
    } else {
      navigation.goBack()
    }
  };


  useEffect(() => {
    const loadInitials = async () => {
      setInitials(await userData()); 
    };
    loadInitials();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        {backButton && (
          <TouchableOpacity onPress={() => backOnClick()}>
            <Image source={require('../assets/back_Icon.png')}  resizeMode="contain" />
          </TouchableOpacity>
        )}
        {homeButton && (
          <TouchableOpacity onPress={() => {navigation.navigate("LoginScreen", {initialStep: 3 }); setSideBarConfig('loginscreen')}}>
            <Image source={require('../assets/Home.png')} resizeMode="contain" />
          </TouchableOpacity>
        )}
        {showLanguageDropdown && (
          <TouchableOpacity style={styles.languageContainer} onPress={() => {
              onLanguagePress();
            }}
          >
            <View style={styles.iconContainer}>
                <Image source={require('../assets/Language_Icon001.png')} style={styles.globeIcon} />
                <Text style={styles.languageLabel}>{selectedLanguageLabel}</Text>
            </View>
          </TouchableOpacity>
        )}
       <View style={styles.titleWrapper}>
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subTitle && (<Text style={styles.subTitle}>{subTitle}</Text>)}
          </View>
        )}
        </View>
        <View>
          { isShowSlide ==true && (
            <TouchableOpacity onPress={handleMenuPress} style={styles.menuIconContainer}>
        <Icon name="menu" size={20} style={styles.menuIcon} />
        </TouchableOpacity>
          )}
          { isShowSlide == false && (
           <View style={styles.profile}>
            <Tooltip
             isVisible={toolTipVisible}
             content={<Text>{initials}</Text>}
             placement="bottom"
             onClose={() => setToolTipVisible(false)}
            >
              <TouchableOpacity onPress={() => setToolTipVisible(true)}>
                  <Image source={require('../assets/User_Icon.png')}  resizeMode="contain" />
              </TouchableOpacity>
           </Tooltip>
         </View>
          )}
          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    height: 60,
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
  languageContainer: {         
    borderWidth: 1, 
    borderColor: '#fff',         
    borderRadius: 8,         
    paddingHorizontal: 8,         
    paddingVertical: 4,         
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  iconContainer: {     
    flexDirection: 'row',     
    alignItems: 'center',   
    backgroundColor: '#4BA6F7'
  },
  globeIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  languageLabel: {
    color: '#fff', 
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'vestas-sans-book',
    paddingTop: 3
  },
  titleWrapper: {         
    position: 'relative', 
    left: -16,         
    right: 0,         
    alignItems: 'center',        
    justifyContent: 'center', 
  },
  titleContainer : {
    flexDirection: "row", 
    alignItems: "center"
  },
  title : {
    color : "#ffffff",
    fontSize : 22,
    fontFamily: 'vestas-sans-book',
    textAlign: 'center'
  },
  subTitle:{
    color : "#b7dbfc",
    fontSize : 22,
    marginLeft : 10
  },
  profile: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center"
  },
  userName: { 
    color : "#fff",
    marginRight: 10,
    fontWeight : "300",
    fontSize : 12
  },
  userIcon: { 
    color : "#fff"
  },
  menuIconContainer: {
    // padding: 8,
    marginTop: 0,
    marginLeft: 10,
    shadowOffset: { width: 0, height: 2 },

    elevation: 4,
  },
  menuIcon: {
    color: 'white',
  },
  iconStyle: {
    width: 0, 
    height: 0, 
  },
});

export default UserHeader;
