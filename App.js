import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { NavigationContainer, useNavigation, useRoute } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  BackHandler,
  ImageBackground,
} from "react-native";
import { useFonts } from "expo-font";
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { NavigationContext } from "./Shared/NavigationContext";

import HomeScreen from "./Pages/HomeScreen";
import YawSystemOverview from "./Pages/YawOverview";
import FiveChapters from "./Pages/5_1_ChapterOverview";
import IntroScreen from "./Pages/introScreen";
import TaskComponent from "./Pages/chapterComponents";
import VTPScreen from "./Pages/VTP_Screen";
import DownloadYawScreen from "./Pages/DownloadScreen";
import LoginScreen from "./Pages/LoginScreen";
import ActivityScreen from "./Pages/ActivityScreen";
import { WarningProvider } from "./Shared/warningContext";
import CustomSidebar from "./Shared/customSideBar";
import EsifScreen from "./Pages/EsifScreen"


import environment from "./enviroments/enviroment";
import { getProgressPercentage, getTurbineProgressPercentage } from "./util/timeStamp";
import { getCurrentTurbineInstance, setCurrentTurbineInstance, userData, getLogOut } from "./util/asyncUtils";
import { systemStatus } from "./constants/systemModule";
import { LanguageProvider } from "./Shared/languageContext";

import { WebView } from 'react-native-webview';
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
export const Base64Context = React.createContext()



const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VTPScreen" component={VTPScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="DownloadYawScreen" component={DownloadYawScreen} />
      <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EsifScreen" component={EsifScreen} />
      <Stack.Screen name="IntroScreen" component={IntroScreen} />
      <Stack.Screen name="YawSystemOverview" component={YawSystemOverview} />
      <Stack.Screen name="FiveChapters" component={FiveChapters} />
      <Stack.Screen name="TaskComponent" component={TaskComponent} />
    </Stack.Navigator>
  );
};
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerPosition: "right", swipeEnabled: false }}
      drawerContent={(props) => <CustomSidebar {...props} />}
    >
      <Drawer.Screen name="MainStack" component={MainStackNavigator} />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [hasWarningBeenShown, setHasWarningBeenShown] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [currentTask, setCurrentTask] = useState("");
  const [navigationTargets, setNavigationTargets] = useState({});

  const [lastScreen, setLastScreen] = useState({ name: null, params: {} });
  const [fromSidebar, setFromSidebar] = useState(false);

  const [isOnline, setIsOnline] = useState(true);
  const [base64Data, setBase64Data] = useState([]);

  const [sideBarConfig, setSideBarConfig] = useState('yes');
  const [videoMode, setVideoMode] = useState(true);

  const [isAuthedicated, setIsAuthendicated] = useState(false);
  const [email, setEmail] = useState('');

  const updateBase64Data = (newData) => {
    setBase64Data(newData);
  };

  
  
  const providerValue = useMemo(
    () => ({
      currentSection,
      setCurrentSection,
      navigationTargets,
       setNavigationTargets,
      lastScreen,
      setLastScreen,
      sideBarConfig,
      setSideBarConfig,
      videoMode,
      setVideoMode,
      fromSidebar,
      setFromSidebar,
      setCurrentTask,
      currentTask,
      email,
      setEmail,
      setIsAuthendicated
    }),
    [currentSection, currentTask, lastScreen, fromSidebar, sideBarConfig, videoMode, email, isAuthedicated]
  );

  const showWarning = useCallback(() => {
    if (!hasWarningBeenShown) {
      setHasWarningBeenShown(true);
    }
  }, [hasWarningBeenShown]);


  const [fontsLoaded, fontError] = useFonts({
    "vestas-sans": require("./assets/fonts/VestasSans-Standard.otf"),
    "vestas-sans-bold": require("./assets/fonts/VestasSans-Bold.otf"),
    "vestas-sans-book": require("./assets/fonts/VestasSans-Book.otf"),
    "vestas-sans-extrabold": require("./assets/fonts/VestasSans-Extrabold.otf"),
    "vestas-sans-headline": require("./assets/fonts/VestasSans-Headline.otf"),
    "vestas-sans-heavy": require("./assets/fonts/VestasSans-Heavy.otf"),
    "vestas-sans-light": require("./assets/fonts/VestasSans-Light.otf"),
    "vestas-sans-medium": require("./assets/fonts/VestasSans-Medium.otf"),
    "vestas-sans-semibold": require("./assets/fonts/VestasSans-Semibold.otf"),
    "vestas-sans-thin": require("./assets/fonts/VestasSans-Thin.otf"),
  });

  // Work to be done
  useEffect(() => {
    const fetchData = async () => {
      //HELPS: uncooment to restart only debugging 
      //  await AsyncStorage.removeItem("email"); 
      // await AsyncStorage.removeItem("my-key");
      // await AsyncStorage.removeItem("logout");
      // await AsyncStorage.removeItem("selectedLanguage");
      // await AsyncStorage.removeItem("currentSystem");
      // await AsyncStorage.removeItem("downloadShown");
      try {
        const turbineInstance = await getCurrentTurbineInstance();
        const email = await userData();
        if (turbineInstance && email) {
          // const dataSize = new TextEncoder().encode(turbineInstance).length;
          // console.log('Data size (in bytes):', dataSize);
          turbineInstance.email = email;
          if (turbineInstance.hasOwnProperty('module') == true) {
            turbineInstance.module = await Promise.all(
              turbineInstance?.module?.map(async (m) => {
                if (m?.id === turbineInstance?.moduleId) {
                  const progressPercentage = await getProgressPercentage(m?.id);
                  return {
                    ...m,
                    progressPercentage: progressPercentage,
                    isProgressStatus : progressPercentage == 0 ? systemStatus.NOT_STARTED :  progressPercentage == 100 ? systemStatus.COMPLETED : systemStatus.IN_PROGRESS 
                  };
                }
                return m;
              })
            );
          }
          turbineInstance.overallPercentage = await getTurbineProgressPercentage(turbineInstance);
          if (turbineInstance.hasOwnProperty('tasks') == true) {
            turbineInstance.tasks = turbineInstance.tasks.map((task) => {
              const matchingBase64 = base64Data.find((data) => data.taskId === task.taskId && data.turbineId == turbineInstance.turbineId);
              if (matchingBase64) {
                return {
                  ...task,
                  base64Url: matchingBase64.base64Url,
                  imageUri: matchingBase64.imageUri,
                };
              }
          
              return task;
            });
          }

          if (!isOnline) {
            await setCurrentTurbineInstance(turbineInstance);
            console.log('Device is offline system.');
            return;
          }
          const headers = {
            'X-access-Token': 'Yn8uMnYevYiDhsmwaIhcg==',
            'Content-Type': 'application/json',

          };

          let response = await axios.post(`${environment.test_api}/vtp/upset`, turbineInstance, {
            headers: headers,
          });
          if(response?.data?._id && (!turbineInstance._id)){
            turbineInstance._id = response?.data?._id;
          }
          await setCurrentTurbineInstance(turbineInstance);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    fetchData()
    // const timer = setInterval(fetchData, 5000);

    return () => {
    //   clearInterval(timer);
      unsubscribe()

    }
  });

  useEffect(()=>{
    const checkEmail = async () => {
      try {
        const asyncEmail = await userData();
        const logout = await getLogOut();
        if (!logout &&  asyncEmail) {
          console.log('asyncEmail: ', asyncEmail, logout);
          setIsAuthendicated(true);
        } else if(logout) {
          setIsAuthendicated(false);
        }
      } catch (error) {
        console.error('Failed to get email from AsyncStorage:', error);
      }
    };
    checkEmail();
  }, []);

  const _onNavigationStateChange=(webViewState)=>{
    console.log(webViewState.url);
    if(webViewState.url.includes('https://vestasb2cauth.azurewebsites.net/vtp&token=')){
      let token = webViewState.url.split('token=');
      console.log('token: ', token[1]);
      if(token != null){
        const decoded = jwtDecode(token[1]);
        const idp_access_token = decoded["idp_access_token"];
        if(idp_access_token){
          const _decoded_idp_token = jwtDecode(idp_access_token);
          const email = _decoded_idp_token['unique_name'];
          const _email = email.split('@');
          const initials = _email[0];
          setEmail(initials);
          console.log('internal login: ', initials);
          setIsAuthendicated(true);
        }else{
          const email = decoded['email'];
          setEmail(email);
          console.log('external login: ', email);
          setIsAuthendicated(true);
        }
        
      }
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} >
      <Base64Context.Provider value={{ base64Data, updateBase64Data }}>
        <LanguageProvider>  
          <WarningProvider>

            <NavigationContext.Provider value={providerValue}>
              <StatusBar backgroundColor='#4ba6f7' barStyle='light-content' />
              {/* <SafeAreaView style={{flex:1}} forceInset={{top: 'never'}}>  */}
              
              <SafeAreaView style={{ flex: 0, backgroundColor: '#4ba6f7' }} />
              <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

                {/* <SafeAreaView style={{flex:1}} forceInset={{ top: 'never', bottom: 'always' }}> */}
                <ImageBackground
                  source={require("./assets/Solid_BG.png")}
                  resizeMode="cover"
                  style={styles.container}
                  imageStyle={styles.backgroundImage}
                >
                  { !isAuthedicated &&
                    <WebView
                    source={{ uri: 'https://vestasb2cauth.azurewebsites.net/#/?redirecturl=vtp' }} style={{ flex: 1 }}
                    onNavigationStateChange={_onNavigationStateChange.bind(this)}
                    javaScriptEnabled = {true}
                    domStorageEnabled = {false}
                    startInLoadingState={false}
                    incognito={true}
                    />
                  }
                  { isAuthedicated &&
                    <NavigationContainer>
                      <DrawerNavigator />
                    </NavigationContainer>
                  }
                </ImageBackground>
              </SafeAreaView>
            </NavigationContext.Provider>
          </WarningProvider>
        </LanguageProvider>
      </Base64Context.Provider>
    </GestureHandlerRootView>

  );
};
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    // backgroundColor: "#fff",
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  container: {
    flex: 1,
  
  }
});
export default App;
