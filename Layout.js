import React, {useContext} from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import Header from "./Header/Header";
import UserHeader from "./Header/UserHeader";
import Footer from "./Footer/Footer";
import { NavigationContext } from './Shared/NavigationContext';
import { makeAllTurbineInstanceFalse } from "./util/asyncUtils";

const Layout = ({
  children,
  onBack,
  onNext,
  onEsif,
  onNew,
  backEnabled = true,
  nextEnabled = true,
  esifEnabled = false,
  newEnabled = false,
  navigation,
  chapterData = [],
  showMenu = true,
  title = null,
  subTitle = null,
  backButton = false,
  homeButton = true,
  isUserHeader = true,
  isFooterShow = true,
  isHeader = false,
  backScreen = "",
  backScreenParams = null,
  fromSidebar,
  handleBackPress,
  isShowSlide,
  showLanguageDropdown = false,
  pauseVideo,
  onLanguagePress,
  selectedLanguageLabel
}) => {

  const [modalVisible, setModalVisible] = React.useState(false);
  const {setSideBarConfig } = useContext(NavigationContext);

  const handleMenuPress = () => {
    setModalVisible(true);
  };

  const navigateToChapter = (targetScreen, params) => {
    navigation.navigate(targetScreen, params);
    setModalVisible(false);
  };

  const navEnterDetails = async () => {
    setSideBarConfig('loginscreen');
    const success = await makeAllTurbineInstanceFalse();

    if (success) {
      
        navigation.navigate("LoginScreen", { initialStep: 2 });
    } else {
        console.error("Failed to update turbine instances, navigation aborted.");
    }
};

  return (
    <View style={styles.container}>
        {isUserHeader && (
          <UserHeader 
            navigation={navigation} 
            title={title} 
            subTitle={subTitle} 
            backButton={backButton || fromSidebar} 
            homeButton={homeButton}
            backScreen={backScreen}
            backScreenParams ={backScreenParams}
            onPressBack={fromSidebar ? handleBackPress : undefined}
            isShowSlide={isShowSlide}
            showLanguageDropdown={showLanguageDropdown}
            onMenuPress={pauseVideo}
            onLanguagePress={onLanguagePress}
            selectedLanguageLabel={selectedLanguageLabel}
          />
        )}
        {isHeader && ( 
          <Header 
            navigation={navigation} 
          /> 
        )}
        {children}

        {onNew && (
          <TouchableOpacity style={styles.hangingNewIcon} onPress={() => {navEnterDetails()}}>
            <Image source={require('./assets/plus.png')} title="New" resizeMode="contain" />
          </TouchableOpacity>
        )}

        {isFooterShow && (
          <Footer 
            navigation={navigation} 
            onBack={onBack} 
            onNext={onNext} 
            onEsif={onEsif}
            nextEnabled={nextEnabled} 
            backEnabled={backEnabled}
            esifEnabled={esifEnabled}
            newEnabled = {newEnabled}
          />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  hangingNewIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: 'white',
    borderRadius: 50
  },
  menuItem: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  menuText: {
    fontSize: 18,
  },
});

export default Layout;
