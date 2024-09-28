import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Alert, TouchableOpacity, Image, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';

import { useWindowDimensions } from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import Layout from '../Layout';
import environment from '../enviroments/enviroment';

import { systemData, systemStatus } from '../constants/systemModule';
import { getCurrentTurbineInstance, setCurrentTurbineInstance, isEmailExist, getCurrentTurbineModule, userData, setLogOut, isDetailsExist, getCurrent } from '../util/asyncUtils';
import { LanguageContext } from "../Shared/languageContext";
import { NavigationContext } from '../Shared/NavigationContext';

import { dataSet } from '../assets/config/sourceConfig';
import { setCurrent } from '../util/asyncUtils';

import { isServiceExistAPI } from '../api/isServiceCheckAPI'
import useInternetStatus from '../hooks/deviceNetworkStatus';
//mport abbreviation_en from '../assets/config/en/abbreviation_rotor.json';


const LoginScreen = ({ navigation, route }) => {
  const { labels, setAbbreviation, selectedLanguage, setSystemContent, currentSystem, setCurrentSystem } = useContext(LanguageContext);
  const [currentStep, setCurrentStep] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [backEnabled, setBackEnabled] = useState(false);
  const [selectedSystem, setselectedSystem] = useState(null);
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [serviceOrder, setServiceOrder] = useState('');
  const [systemDataState, setSystemDataState] = useState(systemData);
  const {email} = useContext(NavigationContext);

  const { setCurrentSection, setCurrentTask, setNavigationTargets } = useContext(NavigationContext)

  const isOnline = useInternetStatus();
  
  useEffect(() => {
    const initializeData = async () => {
      const initialStep = route.params?.initialStep || 1;
      setCurrentStep(initialStep);
      setSelectedSystem(null);
    };
    
    initializeData();

  }, [route.params?.initialStep]);

  useEffect(() => {
    if(currentStep === 1){
      handleNext(email)
    }
    if ((currentStep === 3 || (serviceOrder && inputValue)) && /^[a-z0-9]+$/.test(serviceOrder) && /^[a-z0-9]+$/.test(inputValue)) {
      setNextEnabled(true);
    } else {
      setNextEnabled(false);
    }

    setBackEnabled(currentStep === 1 ? false : true)
  }, [serviceOrder, inputValue, selectedSystem, currentStep]);

  // useEffect(() => {
  //   const handleAsyncOperations = async () => {
  //     if (currentStep === 1 && isEmailExist) {
  //       try {
  //         await AsyncStorage.removeItem('my-key');
  //         console.log('Item removed from AsyncStorage');
  //       } catch (error) {
  //         console.error('Failed to remove item from AsyncStorage:', error);
  //       }
  //     }
  //     console.log(currentStep)

  //   };

  //   handleAsyncOperations();
  // }, [currentStep]);

  useEffect(() => {
    if (currentStep === 3) {
      const loadOnce = async () => {
        try {
       const currentTurbine = await getCurrentTurbineInstance();

          if(currentTurbine?.module){
            const updatedSystemData = await Promise.all(systemData?.map(async (item) => {
              const cTurbineModule = currentTurbine?.module?.find(m => m?.id === item?.id) || null;
  
  
              if (cTurbineModule) {
                return {
                  ...item,
                  isProgressStatus: cTurbineModule.isProgressStatus,
                  progressPercentage: cTurbineModule.progressPercentage,
                  isDownload: cTurbineModule.isDownload,
                };
              }
        
              return item;
            }));
            currentTurbine.module = currentTurbine.module.filter(mod => mod !== null);

            await setCurrentTurbineInstance(currentTurbine);
            setSystemDataState(updatedSystemData);
        
            console.log('System data successfully updated.');
        
          }
        } catch (error) {
          console.error('Error fetching progress percentages or updating state:', error);
        }
      };
      
      loadOnce()
    }
  }, [route?.params, currentStep,selectedSystem])

  useEffect(()=>{
    if(selectedSystem != null){
      handleNext();
    }
    
  }, [selectedSystem]);


  const handleDownloadPress = async (item, index) => {
    try {
      const currentTurbineInstance = await getCurrentTurbineInstance();
      let progress = 0;
      const updateDownloadProgress = () => {
        const interval = setInterval(() => {
          if (progress >= 100) {
            clearInterval(interval);
          } else {
            progress += 25;
            updateSystemDataState(item, index, progress);
          }
        }, 1000);
      };

      const updateSystemDataState = (item, index, progress) => {
        // console.log(item, index, progress)
        const updatedSystemData = [...systemDataState];
        updatedSystemData[index] = {
          ...updatedSystemData[index],
          isDownload: true,
          // isProgressStatus : item.isProgressStatus == systemStatus.NOT_DOWNLOADED ? systemStatus.DOWNLOADED : systemStatus.NOT_STARTED,
          isProgressStatus: progress == 100 ? systemStatus.NOT_STARTED : systemStatus.DOWNLOADED,
          downloadProgressPercentage: progress,
        };
        setSystemDataState(updatedSystemData);
      };

      // Fetch and update the current turbine instance
      const updateTurbineInstance = async () => {
        // console.log(currentTurbineInstance);
        // console.log("================currentTurbineInstance")

        if (!currentTurbineInstance) {
          throw new Error('Failed to fetch current turbine instance.');
        }

        const updatedTurbineInstance = { ...currentTurbineInstance };
        if (!updatedTurbineInstance.module) {
          updatedTurbineInstance.module = [];
        }

        updatedTurbineInstance.moduleId = item?.id;
        const isModuleFound = updatedTurbineInstance.module.some(t => t?.id === item?.id);

        if (!isModuleFound) {
          item.isDownload = true;
          item.downloadProgressPercentage = 100;
          item.isProgressStatus = systemStatus.NOT_STARTED,

            updatedTurbineInstance.module.push(item);
        }

        await setCurrentTurbineInstance(updatedTurbineInstance);
      };

      updateDownloadProgress();
      await updateTurbineInstance();
    } catch (error) {
      console.error('Failed to handle download press:', error);
    }
  };

  useEffect(() => {
    if (width < height) {
      setOrientation("portrait")
    } else {
      setOrientation("landscape")
    }
    
  }, [width, height])

  navigateToSystem = async (item) => {
    setAbbreviation(dataSet[item.id][selectedLanguage].abbrevation);
    setSystemContent(dataSet[item.id][selectedLanguage].content);
    setselectedSystem(item);
    setCurrentSystem(item);
    setCurrent(selectedLanguage, item);
    //handleNext();
    console.log('selected system: ', item);selectedLanguage
    console.log('selected language: ', selectedLanguage);
   
  }

  const handleServicOrder = (text) => {
    if (/^\d{1,6}$/.test(text) && text.length <= 6) {
      setServiceOrder(text);
      setNextEnabled(text.length === 6);
    } else {
      setServiceOrder(text.replace(/[^\d]/g, ''));
    }
    if(warningMessage){
      setWarningMessage('');
    }
  };
  const handleInputChange = (text, currentStep) => {
    if (currentStep === 2) {
      if (/^\d{1,6}$/.test(text) && text.length <= 6) {
        setInputValue(text);
        setNextEnabled(text.length === 6);
      } else {
        setInputValue(text.replace(/[^\d]/g, ''));
      }
      if(warningMessage){
        setWarningMessage('');
      }
    } else {
      setInputValue(text);
    }
  };

  const handleNext = async (email) => {
    if (currentStep === 2 && (serviceOrder.length !== 6 || inputValue.length !== 6 )) {
      setWarningMessage('Please enter valid Details');
      return;
    }
    try {
      if (currentStep <= 3) {

        if (currentStep === 1 && email?.length > 0 ) {
          // console.log('trying' , email)                                                                       
          setLoading(true);

          const headers = {
            'X-access-Token': 'Yn8uMnYevYiDhsmwaIhcg==',
          };
          const response = await axios.get(`${environment.test_api}/getsapids?type=individual&initials=${email}`, {
            headers: headers,
          });

          if (response?.data?.length === 0) {
            setLoading(false);
            showAlert('Error', 'User not Found. Retry with correct initials.');
          } else {
            let email = response?.data[0]?.initials ? response?.data[0]?.initials : response?.data[0]?.intials;
            console.log('response?.data[0].initials;', email)
            let prevoiusEmail = await userData()
            setInputValue('');
            setLoading(false);
             setNextEnabled(false);

             if(email == prevoiusEmail){
              await setLogOut(false)
              navigation.navigate('ActivityScreen');
            }
            else{
              console.log("else  login")
             
              await AsyncStorage.setItem('email', JSON.stringify(email));
              await AsyncStorage.removeItem('my-key');
              await setLogOut(false)
              navigation.navigate('ActivityScreen');
            }
            
            
            
          }
        } else if (currentStep === 2 && serviceOrder.length === 6 && inputValue.length === 6) {
          let isExist;
          setLoading(true);
          if(isOnline ==true){
            isExist  = await isServiceExistAPI(serviceOrder,inputValue);
            if (isExist?.userEntry) {
              setLoading(false);
              setWarningMessage('Turbine ID and Service Order already exist.');
              return;
            }else{
              isExist = await isDetailsExist(inputValue, serviceOrder);
            if (isExist) {
              setLoading(false);
              setWarningMessage('Turbine ID and Service Order already exist.');
              return;
            }
            }
          }else{
            isExist = await isDetailsExist(inputValue, serviceOrder);
            if (isExist) {
              setLoading(false);
              setWarningMessage('Turbine ID and Service Order already exist.');
              return;
            }
          }
          

            const newTurbineInstance = {
              deviceId: await DeviceInfo.getUniqueId(),
              turbineId: inputValue,
              serviceOrder: serviceOrder,
              isCurrentTurbine: true,
              overallPercentage : 0
            };
            setLoading(false);
            await setCurrentTurbineInstance(newTurbineInstance, true);
            setCurrentStep(currentStep + 1);
            setInputValue('');
            setServiceOrder('');
            setNextEnabled(false);


        } else if (currentStep === 3) {

          const currentTurbineInstance = await getCurrentTurbineInstance();
          let _data = await getCurrent();

          const updatedTurbineInstance = { ...currentTurbineInstance };

          console.log('selectedSystem?.id  from login: ', selectedSystem )

          if(selectedSystem?.id == 0){
            setNavigationTargets({
              "5.1.1": "TaskComponent",
              "5.1.2": "TaskComponent",
              "5.1.3": "TaskComponent",
              "5.1.5": "TaskComponent",
              "5.1.6": "TaskComponent",
              "5.1.8": "TaskComponent",
              "5.2.1": "TaskComponent",
              "5.2.2": "TaskComponent",
              "5.2.3": "TaskComponent",
              "5.3.0": "TaskComponent",
              "5.3.1": "TaskComponent",
              "5.3.2": "TaskComponent",
              "5.3.4": "TaskComponent",
              "5.4.1": "TaskComponent",
              "5.4.2": "TaskComponent",
            });
            setCurrentSection("5.1"), setCurrentTask("5.1.1")

          }else {
            setNavigationTargets({
              "5.2.6.13": "TaskComponent",
              "5.2.6.14": "TaskComponent",
            });
            setCurrentSection("5.2"), setCurrentTask("5.2.6.13")

          }
          updatedTurbineInstance.moduleId = _data?.id;

          let isModuleFound = null;
          if(updatedTurbineInstance['module']){
            isModuleFound= updatedTurbineInstance?.module?.find(t => t?.id === _data?.id);

          }

          if (!isModuleFound) {
            if (!updatedTurbineInstance.module) {
              updatedTurbineInstance.module = []; 
            }
            updatedTurbineInstance.module.push(selectedSystem);
          } 

          await setCurrentTurbineInstance(updatedTurbineInstance);

          if (_data?.id == 0 || 1) {
            const downloadShown = await AsyncStorage.getItem('downloadShown');
            if (downloadShown) {
              navigation.navigate('Home', {system: selectedSystem});
            } else {
              navigation.navigate('Home', {system: selectedSystem});
              //navigation.navigate('DownloadYawScreen');
            }
          }
        } else {
          if (inputValue?.length == 0 && currentStep == 1) {

            showAlert('Error', 'Enter the vestas Initals');
          } else if (inputValue?.length == 0 && currentStep == 2) {

            showAlert('Error', 'Enter the Turbine Id');

          } else if (serviceOrder?.length == 0 && currentStep == 2) {
            showAlert('Error', 'Enter the Service Order');
          }
        }

      } else {

        //navigation.navigate('DownloadYawScreen');
      }
    } catch (error) {
      setLoading(false);
      console.info('Network error:', error);
      if (error.message === 'Network Error') {
        showAlert('Error', 'Network error. Please check your internet connection.');
      } else {
        showAlert('Error', 'Failed to fetch data');
      }
    }
  };

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'Retry', onPress: () => console.log('OK Pressed') }],
      { cancelable: false }
    );
  };

  const handleBack = () => {
    if (currentStep > 1) {
      console.log("if back")
      setCurrentStep(currentStep - 1);
      setInputValue('');
      setServiceOrder('');
    } else {
      console.log("else back")

      navigation.goBack();
    }
  };

  const handleBackButton = () => {
    navigation.navigate('ActivityScreen');
  }

  const getImageSource = (status) => {
    console.log(status)
    switch (status) {
      case systemStatus.NOT_DOWNLOADED:
        return { icon: require('../assets/download_icon.png'), width: 28, height: 28 };
      case systemStatus.DOWNLOADED:
        return { icon: require('../assets/DownLoad_Icon_blue.png'), width: 28, height: 28 };
      case systemStatus.IN_PROGRESS:
        return { icon: require('../assets/Status_Orange.png'), width: 24, height: 24 };
      case systemStatus.NOT_STARTED:
        return { icon: require('../assets/Status_Gray.png'), width: 26, height: 26 };
      case systemStatus.COMPLETED:
        return { icon: require('../assets/Status_Green.png'), width: 26, height: 26 };
      default:
        return null; // Handle unexpected cases
    }
  };

  const getBackgroundColor = (status) => {
    switch (status) {
      case 0:
      case 1:
      case 2:
        return 'rgba(224, 224, 224, 0.5)';
      case 3:
        return 'rgba(225, 125, 40, 0.35)';
      case 4:
        return 'rgba(25, 115, 110, 0.8)';
      default:
        return 'transparent';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={orientation === 'portrait' ? styles.inputContainer : styles.inputContainerLandscape}>
                <Image style={orientation === 'portrait' ? styles.userIcon : styles.userIconLandscape} source={require('../assets/user_circle.png')} resizeMode="contain" />

                <View style={orientation === 'portrait' ? styles.inputItem : styles.inputItemLandscape}>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.title, { fontFamily: "vestas-sans-medium" }]}>Logged in as</Text>
                  </View>
                  <Text style={[styles.title, { fontFamily: "vestas-sans-medium" }]}>{email}</Text>

                  {/* <TextInput
                    style={styles.input}
                    placeholder = {labels.loginScreen.placeholder} 
                    placeholderTextColor="#ccc"
                    value={inputValue}
                    onChangeText={handleInputChange}
                     //style={styles.button}
                  /> */} 
                  <TouchableOpacity  onPress={handleNext} disabled={loading} style={{  marginTop: 20 }}>
                    <ActivityIndicator color="white" style={{ position: 'absolute', alignSelf: 'center' }} />
                    {/* <Text style={styles.buttonText}>{loading ? <ActivityIndicator color="white" style={{ position: 'absolute', alignSelf: 'center' }} /> : labels.footer.next}</Text> */}
                  </TouchableOpacity>
                  
                </View>

              </View>
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>
        );
      case 2:
        return (
          <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={orientation === 'portrait' ? styles.inputContainer : styles.inputContainerLandscape}>
                <Image style={orientation === 'portrait' ? styles.userIcon : styles.userIconLandscape} source={require('../assets/turbine_circle.png')} resizeMode="contain" />
                <View style={orientation === 'portrait' ? styles.inputItem : styles.inputItemLandscape}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{labels.loginScreen.enter} </Text>
                    <Text style={[styles.title, { fontFamily: "vestas-sans-semibold" }]}>{labels.loginScreen.details}</Text>
                  </View>
                  <TextInput
                    style={warningMessage.length > 0 ? styles.trubineInput : styles.input}
                    placeholder= {labels.ActivityScreen.serviceOrder} 
                    placeholderTextColor="#ccc"
                    maxLength={6}
                    keyboardType="numeric"
                    value={serviceOrder}
                    onChangeText={(text) => handleServicOrder(text, 2)}
                  // onFocus={() => handleFocus('240076')}
                  />
                  <TextInput
                    style={warningMessage.length > 0 ? styles.trubineInput : styles.input}
                    placeholder= {labels.ActivityScreen.turbineid} 
                    placeholderTextColor="#ccc"
                    maxLength={6}
                    keyboardType="numeric"
                    value={inputValue}
                    onChangeText={(text) => handleInputChange(text, 2)}
                  // onFocus={() => handleFocus('240076')}
                  />
                  {warningMessage.length > 0 && (
                    <View style={styles.warningContainer}>
                      <Image source={require('../assets/warning-icon-3.png')} style={styles.warningIcon} />
                      <Text style={styles.warningText}>{warningMessage}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.button} onPress={handleNext} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? <ActivityIndicator color="white" style={{ position: 'absolute', alignSelf: 'center' }} /> :  labels.footer.next}</Text>
                    
                  </TouchableOpacity>
                  <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
                      <Image source={require('../assets/Extn_Arrow.png')} resizeMode="contain" style={{ width: 30 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>
        );
      case 3:
        return (
          <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} >
            <View style={orientation === 'portrait' ? styles.inputContainer : styles.inputContainerLandscape}>
              <Image style={orientation === 'portrait' ? styles.userIcon : styles.userIconLandscape} source={require('../assets/service_circle.png')} resizeMode="contain" />
              <View style={orientation === 'portrait' ? styles.inputItem : styles.inputItemLandscape}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{labels.loginScreen.service} </Text>
                  <Text style={[styles.title, { fontFamily: "vestas-sans-semibold" }]}>{labels.loginScreen.task}</Text>
                </View>

                {systemDataState?.map((item, index) => (
                  <TouchableOpacity key={index}
                    onPress={() => [0, 1].includes(item.isProgressStatus) ? handleDownloadPress(item, index) : navigateToSystem(item)}
                    style={styles.touchableWrapper}
                  >
                    <View key={index} style={[styles.listItemContainer, { "backgroundColor": getBackgroundColor(item.isProgressStatus), "borderColor": getBackgroundColor(item.isProgressStatus), }]}>
                      <View style={styles.listItemWrapper}>
                        <View style={styles.listItem}>
                          <Text style={[styles.label,  { color: '#000' } ]}>{item.label}</Text>
                        </View>

                        {[0, 1, 2, 3, 4].includes(item.isProgressStatus) ?
                          <View style={styles.downloadContainer} >
                              <Image
                                source={getImageSource(item.isProgressStatus)?.icon}
                                style={[
                                  {
                                    width: getImageSource(item.isProgressStatus)?.width,
                                    height: getImageSource(item.isProgressStatus)?.height
                                  },
                                  item.isProgressStatus === 1 ? styles.downloadIconActive : styles.downloadIcon
                                ]}
                              />
                          </View>
                          : null}
                      </View>
                      {item.isDownload && [0, 1].includes(item.isProgressStatus) && (
                        <View style={styles.progressWrapper}>
                          <View style={styles.progressBar}>
                            <View style={[styles.progress, { width: `${item.downloadProgressPercentage}%` }]} />
                          </View>
                          <Text style={styles.fileSizeText}>{`${item.fileSize}MB`}</Text>
                        </View>
                      )}
                      {[3].includes(item.isProgressStatus) && (
                        <View style={styles.progressWrapper}>
                          <View style={styles.progressBar}>
                            <View style={[styles.progressBarOrange, { width: `${item.progressPercentage}%` }]} />
                          </View>
                          <Text style={styles.fileSizeText}>{`${item.progressPercentage}%`}</Text>
                        </View>
                      )}
                     

                    </View>
                  </TouchableOpacity>
                ))}

              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity style={[styles.backButton, { width: 10 }]} onPress={handleBackButton}>
                  <Image source={require('../assets/Extn_Arrow.png')} resizeMode="contain" style={{ width: 30 }} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      onBack={handleBack}
      onNext={handleNext}
      nextEnabled={nextEnabled}
      showMenu={false}
      backEnabled={backEnabled}
      isUserHeader={false}
      isFooterShow={false}
      isHeader={true}

    >
      <ImageBackground
        source={require("../assets/BG_Layout001.png")}
        style={styles.imageBackground}
        resizeMode='cover'
      >
        <View style={styles.overlay} />

        <View style={styles.container}>

          {renderStepContent()}

        </View>

      </ImageBackground>
    </Layout>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
    width: '100%'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  inputContainer: {
    width: '90%',
    alignItems: 'center',
    display: 'flex',
    marginTop: '25%',
    paddingLeft: '10%'
  },
  inputContainerLandscape: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    padding: 10,
    // backgroundColor: '#6A7E94', 
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontFamily: 'vestas-sans-book',
    textAlign: 'center',
    color: '#fff',
    marginTop: 10
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'grey',
    marginVertical: 3,
    backgroundColor: '#fff'
  },
  trubineInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'grey',
    marginTop: 5,
    backgroundColor: '#fff'
  },
  dropdown: {
    height: 40,
    width: '100%',
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginVertical: 20,
    backgroundColor: '#fff'
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#aaa',
    fontFamily: 'vestas-sans-book'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'grey',
    fontFamily: 'vestas-sans-book',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    color: 'grey',
    fontFamily: 'vestas-sans-book'
  },
  disabledItemText: {
    color: 'lightgrey',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  userIcon: {
    // display: 'none',
    width: 120,
    height: 120,
  },
  userIconLandscape: {
    width: 150,
    height: 150,
    flexBasis: '30%',
    marginTop: '7%'
  },
  inputItem: {
    width: '100%',
  },
  inputItemLandscape: {
    width: '45%',
    flexBasis: '45%',
  },
  button: {
    backgroundColor: "#4ba6f7",
    padding: 25,
    flex: 30,
    alignItems: "center",
    justifyContent: 'center',
    borderRadius: 25,
    width: '100%',
    maxHeight: '14%',
    marginTop: 20
  },
  backButton: {
    backgroundColor: "#ede9e8",
    padding: 25,
    //flex: 30,
    alignItems: "center",
    justifyContent: 'center',
    borderRadius: 25,
    width: '15%',
    maxHeight: '14%',
    marginTop: 20

  },
  buttonText: {
    color: "#fff",
    fontFamily: "vestas-sans-book",
    fontSize: 25,
    zIndex: 9999,
    position: 'absolute',
    // top: 10,
    // paddingTop: 5,
    // letterSpacing: 1,
    textAlign: 'center'
  },
  // touchableWrapper: {
  //   flex: 1
  // },
  listItemContainer: {
    // backgroundColor: '#654841',
    paddingHorizontal: 5,
    paddingBottom: 5,
    borderRadius: 8,
    marginBottom: 25,
    borderWidth: 1,

    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listItemWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    flex: 1
  },
  label: {
    fontSize: 16,
    color: '#a9a9a9',
    textAlign: 'center',
    fontFamily: "vestas-sans-book",
  },
  downloadContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 6,
    marginTop: 3
  },
  downloadIcon: {
    backgroundColor: '#d3d3d3',
    borderRadius: 50,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIconActive: {
    backgroundColor: '#4ba6f7',
    borderRadius: 50,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIconImage: {
    width: 22,
    height: 22,
  },
  fileSizeText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 8,
    marginTop: 2
  },
  progressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#1f3144',
    borderRadius: 2,
    height: 12,
  },
  // progressBarOrange: {
  //   flex: 1, 
  //   backgroundColor: '#E17D28',
  //   borderRadius: 2,
  //   height: 12,
  // },
  progress: {
    height: '100%',
    backgroundColor: '#4ba6f7',
    borderRadius: 2,
  },
  progressBarOrange: {
    height: '100%',
    backgroundColor: '#E17D28',
    borderRadius: 2,
  },
  progressBarGreen: {
    height: '100%',
    backgroundColor: '#19736E',
    borderRadius: 2,
  },

  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  warningIcon: {
    width: 15,
    height: 15,
    marginRight: 5,
    resizeMode: "contain"
  },
  warningText: {
    fontSize: 12,
    color: 'red',
  },
});

export default LoginScreen;