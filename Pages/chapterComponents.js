import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, TouchableWithoutFeedback, Keyboard, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Snackbar from 'react-native-snackbar';

import Layout from '../Layout';
import CheckBox from 'expo-checkbox';
import WarningContext from '../Shared/warningContext';
import CustomTitle from '../Shared/customTitle';
import VideoPlayer from '../Shared/videoPlayerPoc';
import { NavigationContext } from '../Shared/NavigationContext';
import WarningModal from '../Shared/warningModal';
import ImagePicker from '../Shared/imagePicker';
import updateTaskAsyncStorage from '../util/task-async-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTimeStamp, getTimeStampDone } from '../util/timeStamp';
import { getCurrentTask, getCurrentTurbineInstance, updateCurrentTask } from '../util/asyncUtils';
import { LanguageContext } from "../Shared/languageContext";
import { dataSet } from '../assets/config/sourceConfig';
import { getCurrent } from '../util/asyncUtils';


const TaskComponent = ({ route }) => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const { task, sectionTitle, id, lang } = route.params;
  const [isWarningVisible, setWarningVisible] = useState(false);
  const [isStepVerified, setStepVerified] = useState(false);
  const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState(0);
  const [syncSubtaskId, setSyncSubtaskId] = useState(0);
  const videoRef = useRef(null);
  const scrollViewRef = useRef(null);
  const subtaskRefs = useRef([])
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const { shownWarnings, showWarning } = useContext(WarningContext);
  const { setCurrentSection, setCurrentTask, setSideBarConfig, videoMode, currentSystem, selectedLanguage, sideBarConfig } = useContext(NavigationContext);
  const [enteredText, setEnteredText] = useState('');
  const [modalShown, setModalShown] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [orientation, setOrientation] = useState("portrait");
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState(false);
  const { labels, systemContent } = useContext(LanguageContext);
  const [currentData, setCurrentData] = useState({});
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [header, setHeader] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [videoPopup, setVideoPopup] = useState(false);
  const [videoSnackBar, setVideoSnackBar] = useState(0);
  const [loader, setLoader] = useState(false);

  const isFiveOneOne = task?.id === '5.1.1';
  const isFiveOneFive = task?.id === '5.1.5';
  const isFiveOneEight = task?.id === '5.1.8';
  const isFiveTwoTwo = task?.id === '5.2.2';
  const isFiveTwoOne = task?.id === '5.2.1';
  const isFiveThreeThree = task?.id === '5.3.4';
  const isFiveThreeThreeOne = task?.id === '5.3.4.1';
  const isFiveThreeThreeThree = task?.id === '5.3.4.3';

  const isFiveFourOne = task?.id === '5.4.1';

  const isRotor_thirteen = task?.id === '5.2.6.13';
  const isRotor_fourteen = task?.id === '5.2.6.14';
  const completedTaskIds = ['5.1.8', '5.2.3', '5.3.4', '5.4.2', '5.2.6.14'];

  const refVideoSource = 
    {
     '5.1.5': {source: require('./../assets/config/videos/yaw/Yaw_System_5.1.8.mp4'), 
              label: 'Yaw System 5.1.8'
      },
     '5.3.4.1': {source: require('./../assets/config/videos/yaw/Yaw_System_5.3.4.3.mp4'),
                label: 'Yaw_System_5.3.4.3'
              },
     '5.3.4.3': {source: require('./../assets/config/videos/yaw/Yaw_System_5.3.4.2.mp4'),
                label: 'Yaw_System_5.3.4.2'
              }
    }
  
  


  const fetchCurrent = async (taskId) => {
    let _data = await getCurrent();
    setHeader(dataSet[_data?.id][_data?.lang]["abbrevation"]["HeaderTitle"])
    setSubtitle(dataSet[_data?.id][_data?.lang]["abbrevation"]["subtitle"])
    setCurrentData(dataSet[_data?.id][_data?.lang].videos?.tasks[taskId]);
    return dataSet[_data?.id][_data?.lang].videos?.tasks[taskId];

  }

  useEffect(() => {
    setCurrentSection(sectionTitle.split(' ')[0]);
    if (!shownWarnings[task.id] && task.warning) {
      setWarningVisible(true);
      showWarning(task.id);
    }
    checkStepVerified();
    getStoreInput()

  }, [sectionTitle, task, setCurrentSection, setCurrentTask, syncSubtaskId]);

  useEffect(() => {
    setStepVerified(false);
    setCurrentTask(task?.id);
    fetchCurrent(task?.id);
  }, [task?.id, currentSubtaskIndex]);

  useEffect(() => {
    if (width < height) {
      setOrientation("portrait")
    } else {
      setOrientation("landscape")
    }
  }, [width, height])

  useEffect(() => {
    setSideBarConfig('chapterComponent');
  }, [navigation])

  useEffect(() => {
    if (isAutoScrolling && !isTextInputFocused && isPlaying) {

      const highlightedIndex = getHighlightedIndex();
      setHighlightedIndex(highlightedIndex);

      if (highlightedIndex >= 0 && subtaskRefs.current[highlightedIndex]) {
        subtaskRefs.current[highlightedIndex].measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({ y, animated: true });
          }
        );
      }
    }
  }, [currentTime, isAutoScrolling, isTextInputFocused, isPlaying]);
  
  useEffect(() => {
    if (!videoMode) {
      setIsAutoScrolling(false);
      setHighlightedIndex(-1);
    }
  }, [videoMode]);

  //console.log('task from params: ', task)

  const checkStepVerified = async () => {
    try {
      const currentTurbineInstance = await getCurrentTurbineInstance();
      if (currentTurbineInstance) {

        let taskWithId = ""

        if (currentTurbineInstance?.tasks?.length > 0) {
          let isFilteredTask = currentTurbineInstance.tasks.filter(t => t.taskId == task.id);
          if (isFilteredTask?.length > 1) {
            taskWithId = isFilteredTask.find(ts => ts.subTaskId == syncSubtaskId && ts?.isResume === false);
          } else {
            let id = task.id == '5.3.4.3' ? '5.3.4' : task.id;
            taskWithId = currentTurbineInstance?.tasks?.find(t => t.taskId === id && t?.isResume === false);
          }
        }

        if (taskWithId) {
          setStepVerified(true);
        } else {
          setStepVerified(false);
        }

      }
    } catch (error) {
      console.error('Error', error);
    }
  };


  const handleBack = async () => {
    setSideBarConfig('chapterOverview');
    setLoader(true);
    try {
      const currentTurbineInstance = await getCurrentTurbineInstance();

      if (!task?.checkSkipped && !isFiveThreeThreeThree) {
        if (currentTurbineInstance) {
          const getCurrentTask = currentTurbineInstance?.tasks.find(t => t.taskId === task.id);

          console.log('Current Subtask Index:', currentSubtaskIndex);

          if ((isFiveOneOne || isRotor_thirteen || isRotor_fourteen) && currentSubtaskIndex > 0) {
            const currentResume = currentTurbineInstance?.tasks?.find(t => t.taskId === task.id && t.subTaskId === currentSubtaskIndex)?.isResume || false;
            console.log('Current Resume:', currentResume);
            const taskEnd = {
              currentTaskId: task.id,
              previousTaskId: task.id,
              previousSubTaskId: currentSubtaskIndex,
              endTime: Date.now(),
              currentSubTaskId: currentSubtaskIndex - 1,
              startTime: Date.now(),
              isResume: currentResume,
            };

            await updateTaskAsyncStorage('my-key', taskEnd).then((res)=>{
              if(res){
                setTimeout(async()=>{
                  setLoader(false);
                  await storeInputValue();
                  setCurrentSubtaskIndex(currentSubtaskIndex - 1);
                  setSyncSubtaskId(pre => pre - 1)
                  console.log('Handle Back - Task End:', taskEnd);
                },300)
               
              }
            }).catch((e)=>{
              console.log("Error Syncing!", e)
            });
            

          } else {
            console.log("Else condition: Moving to previous task or navigation.");

            const yawSystemDetail = systemContent.content.find(y => y.id === sectionTitle.split(' ')[0]);
            const prevTaskIndex = yawSystemDetail.task.findIndex(t => t.id === task.id) - 1;
            const prevTask = prevTaskIndex >= 0 ? yawSystemDetail.task[prevTaskIndex] : null;

            if (prevTask) {
              console.log('Previous Task:', prevTask.id, task.id);
              console.log(getCurrentTask)
              // {"currentSubTaskId": 0, "currentTaskId": "5.3.2", "endTime": 1726725691541, "isResume": true, "previousSubTaskId": null, "previousTaskId": "5.3.4", "startTime": 1726725691541}
              const taskEnd = {
                previousTaskId: task.id,
                currentTaskId: prevTask.id,
                endTime: Date.now(),
                startTime: Date.now(),
                isResume: getCurrentTask && !getCurrentTask.isResume ? false : true,
                previousSubTaskId: (task.subtask.length > 0 && ['5.1.5','5.2.1', '5.4.2', '5.3.4', '5.2.2', '5.3.1', '5.3.2',"5.1.8"].indexOf(task.id) === -1) ? task.subtask[task.subtask.length - 1].id : null,
                currentSubTaskId: ['5.1.5','5.2.1', '5.4.2', '5.3.4', '5.2.2', '5.3.1', '5.3.2',"5.1.8"].indexOf(prevTask.id) !== -1 ? null : prevTask.subtask.length ? prevTask.subtask[0].id : null
              };
              console.log("taskEnd", taskEnd)
              if (taskEnd.previousSubTaskId === 3 && taskEnd.previousTaskId === "5.2.6.14") {
                taskEnd.previousSubTaskId = 0;
              }
              if (taskEnd.currentSubTaskId === 0 && taskEnd.currentTaskId === "5.2.6.13") {
                setCurrentSubtaskIndex(1)
                setSyncSubtaskId(1)
                taskEnd.currentSubTaskId = 1;
              }
              await updateTaskAsyncStorage('my-key', taskEnd).then((res)=>{
                if(res){
                  setTimeout(async()=>{
                    setLoader(false);
                    await storeInputValue();
                    navigation.navigate('TaskComponent', {
                      task: prevTask, sectionTitle, id: route.params.id,
                      lang: route.params.lang
                    });
                  },300)
                 
                }
               
              }).catch((e)=>{
                console.log("Error Syncing!", e)
              });
              
            } else {
              console.log("Else else condition: Going back in navigation.");

              const previousRouteIndex = navigation.getState().index - 1;
              const previousComponent = navigation.getState().routes[previousRouteIndex].name;
              console.log('Previous Component:', previousComponent);

              // if (previousComponent === "FiveChapters") {
              const yawSystemDetail = systemContent.content.find(y => y.id === sectionTitle.split(' ')[0]);
              navigation.navigate('FiveChapters', { details: yawSystemDetail.task.filter(z => !z?.hidden).map(a => a.id + " " + a.value), title: yawSystemDetail.id + " " + yawSystemDetail.value, date: new Date() });

              // } else {
              //   navigation.goBack();
              // }
            }
          }
        }
      } else {
        console.log("Else condition for skipped or 5333");
        setTimeout(() => {
          const yawSystemDetail = systemContent.content.find(y => y.id === sectionTitle.split(' ')[0]);
        const prevTaskIndex = yawSystemDetail.task.findIndex(t => t.id === task.id) - 1;
        const prevTask = prevTaskIndex >= 0 ? yawSystemDetail.task[prevTaskIndex] : null;

        if (prevTask) {
          navigation.navigate('TaskComponent', {
            task: prevTask, sectionTitle, id: route.params.id,
            lang: route.params.lang
          });
        }
        },300);
        
      }
      // checkStepVerified();

    } catch (error) {
      console.error('Error in handleBack:', error);
    }
  };


  const handleNext = async () => {
    setLoader(true);
    try {
      if (!task?.checkSkipped && !isFiveThreeThree) {
        const taskId = isFiveThreeThreeThree ? '5.3.4' : task.id;

        if ((isFiveOneOne || isFiveThreeThree || isRotor_thirteen || isRotor_fourteen) && currentSubtaskIndex < ((isRotor_thirteen || isRotor_fourteen) ? 1 : task.subtask.length - 1)) {
          console.log("Moving to next subtask within the same task.");

          const taskEnd = {
            currentTaskId: taskId,
            previousTaskId: taskId,
            previousSubTaskId: currentSubtaskIndex,
            endTime: Date.now(),
            currentSubTaskId: currentSubtaskIndex + 1,
            startTime: Date.now(),
            isResume: isStepVerified === false ? true : false
          };

          await updateTaskAsyncStorage('my-key', taskEnd).then((res)=>{
            if(res){
              setTimeout(async()=>{
                setLoader(false);
                await storeInputValue();
                setCurrentSubtaskIndex(currentSubtaskIndex + 1);
                setSyncSubtaskId(pre => pre + 1);
                
              },300)
              
            }
          }).catch((e)=>{
            console.log("Error Syncing!", e)
          });
          

        } else {
          console.log("Moving to next task or handling completion.");

          const yawSystemDetail = systemContent.content.find(y => y.id === sectionTitle.split(' ')[0]);
          const nextTaskIndex = yawSystemDetail.task.findIndex(t => t.id === task.id) + 1;
          const nextTask = nextTaskIndex < yawSystemDetail.task.length ? yawSystemDetail.task[nextTaskIndex] : null;

          if (nextTask) {
            console.log("Moving to the next task within the same yaw system.");
            let nullSubId = ["5.4.2" ,"5.1.5" ,"5.2.2" ,'5.2.1',"5.3.1","5.3.2","5.3.4","5.1.8"]
            const taskEnd = {
              previousTaskId: taskId,
              currentTaskId: nextTask.id,
              endTime: Date.now(),
              startTime: Date.now(),
              isResume: isStepVerified === false ? true : false,
              previousSubTaskId: task.subtask.length > 0 && (!nullSubId.includes(taskId)) ? task.subtask[task.subtask.length - 1].id : null,
              currentSubTaskId: nextTask.subtask.length > 0 && (!nullSubId.includes(nextTask.id)) ? nextTask.subtask[0].id : null
            };

            if (nextTask?.id === "5.3.4") {
              taskEnd.currentSubTaskId = null;
            }

            if (taskEnd.previousTaskId == "5.2.6.13" && taskEnd.previousSubTaskId == 4) {
              taskEnd.previousSubTaskId = currentSubtaskIndex
            }

            console.log("current task.", taskEnd);

            await updateTaskAsyncStorage('my-key', taskEnd).then((res)=>{
                if(res){
                  setTimeout(async()=>{
                    setLoader(false);
                    await storeInputValue();
                    setCurrentSubtaskIndex(0)
                    setSyncSubtaskId(0)
                    navigation.navigate('TaskComponent', {
                      task: nextTask, sectionTitle, id: route.params.id,
                      lang: route.params.lang
                    });
                  },300)
                 
            // checkStepVerified(nextTask);
                }
            }).catch((e)=>{
              console.log("Error Syncing!", e)
            });
            

          } else if (completedTaskIds.includes(taskId)) {
            console.log("Handling completion of the current task.");

            const taskEnd = {
              previousTaskId: taskId,
              endTime: Date.now(),
              isResume: isStepVerified === false ? true : false,
              previousSubTaskId: task.subtask.length > 0 && (taskId !== "5.1.8" &&taskId !== "5.4.2" && taskId !== "5.3.4") ? task.subtask[task.subtask.length - 1].id : null
            };

            if (taskEnd.previousTaskId == "5.2.6.14" && taskEnd.previousSubTaskId == 3) {
              taskEnd.previousSubTaskId = 1
            }
            console.log("Handling completion of the current task.",taskEnd);

            await updateTaskAsyncStorage('my-key', taskEnd).then((res)=>{
              if(res){
                setTimeout(async()=>{
                  setLoader(false);
                  await storeInputValue();
            const groupId = taskId.slice(0, 3);
            const turbineInstance = await getCurrentTurbineInstance();
            const stampState = await getTimeStampDone([groupId],turbineInstance);
            if (stampState[groupId] === 'completed') {
              setModalShown(true);
            } else {
              navigation.navigate('IntroScreen');
            }
                },300)
                
              }
            }).catch((e)=>{
              console.log("Error Syncing!", e)
            });
            
          }
        }
      } else {
        console.log("Skipping or handling specific case for 5333.");
        setTimeout(async()=>{
          setLoader(false);
        const yawSystemDetail = systemContent.content.find(y => y.id === sectionTitle.split(' ')[0]);
        const nextTaskIndex = yawSystemDetail.task.findIndex(t => t.id === task.id) + 1;
        const nextTask = nextTaskIndex < yawSystemDetail.task.length ? yawSystemDetail.task[nextTaskIndex] : null;
        await storeInputValue();
        if (nextTask) {
          navigation.navigate('TaskComponent', {
            task: nextTask, sectionTitle, id: route.params.id,
            lang: route.params.lang
          });
        }
        },300)
        
      }
      // checkStepVerified();
    } catch (error) {
      console.error('Error in handleNext:', error);
    }
  };
 
  const handleCheckBoxChange = async(newValue) => {
    if ( ((isRotor_thirteen || isRotor_fourteen ) && currentSubtaskIndex === 1 )) {
        if (!inputValue || !inputValue.trim()) {
          Alert.alert(
            'Action Required',
            'You haven\'t entered the measurement.',
            [{ text: 'OK' }]
          );
          return; 
        }
    }
    if (isFiveThreeThreeThree) {
      if (!inputValue || !inputValue.trim()) {
        Alert.alert(
          'Action Required',
          'You haven\'t entered the measurement in 5.3.4.1.',
          [{ text: 'OK' }]
        );
        return;
      }
  
    }
    setStepVerified(newValue);
  };

  const handleNewTask = () => {
    navigation.navigate('IntroScreen');
    setModalShown(false);
  }

  const handleManualScrollStart = () => {
    setIsAutoScrolling(false);
  };

  const handleManualScrollEnd = () => {
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const getHighlightedIndex = () => {
    if(!isPlaying || currentTime === 0) return -1;
    const highlighted = task.subtask.findIndex(sub => {
      const [start, end] = sub.timestamp;
      return currentTime >= start && currentTime <= end;
    });
    return highlighted >= 0 ? highlighted : -1;
  };

  const getHighlightedIndexForSnack = (index, id) =>{
    const highlightConfig = {
      '5.1.5': 3,
      '5.3.4.1':0,
      '5.3.4.3':2
    }
    const currentTask=highlightConfig[task?.id];

    console.log('from 3: ', videoSnackBar,id,  getHighlightedIndex() === 1 && index === 1 && videoSnackBar==0);
    
    if((getHighlightedIndex() === currentTask || id == currentTask) && index === currentTask && videoSnackBar==0){
      setVideoSnackBar(1);
      console.log('snackFlag: ', videoSnackBar);
      Snackbar.show({
        text: 'Reference Video',
        duration: Snackbar.LENGTH_LONG,
        marginBottom: 130,
        action: {
          text: 'Play',
          textColor: 'white',
          onPress: () => {setVideoPopup(true); handleMenuPause()},
        },
      });      
      console.log('snackFlag: ', videoSnackBar);
    }else if(getHighlightedIndex() !== currentTask && index !== currentTask && videoSnackBar==1){
      setVideoSnackBar(videoSnackBar == 1 ? 0 : 0);
    }  

  }

  const toggleWarningModal = () => {
    setWarningVisible(!isWarningVisible);
  };

  const handleTextInputFocus = () => {
    setIsTextInputFocused(true);
    setIsAutoScrolling(false); 
  };
  const handleTextInputBlur = () => {
    setIsTextInputFocused(false);
    setIsAutoScrolling(true); 
  };
  
//  const handlePlayPause = () => {
//     setIsPlaying(prevState => {
//       const newState = !prevState;
//       if (!newState) {
//         setIsAutoScrolling(false); 
//       }
//       return newState;
//     });
//   };
  const handlePlayPause = (playing) => {
    setIsPlaying(playing);
    setIsAutoScrolling(playing && !isVideoEnded); 
  };
  const handleVideoEnd = () => {
    setIsPlaying(false); 
    setIsVideoEnded(true); 
    setIsAutoScrolling(true);
    setHighlightedIndex(0); 
    setCurrentTime(0);
  };

  const handleMenuPause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }

  const handleInputChange = (text) => {
    setInputValue(text);
  };


  const renderList = (list, keyPrefix = '', useLetters = false) => {
    return list.map((item, index) => (
      <View key={`${keyPrefix}-${index}`} style={{ flexDirection: 'row', marginLeft: 20 }}>
        <Text style={{ marginRight: 5, fontSize: 18 }}>
          {useLetters ? `${String.fromCharCode(97 + index)}.` : '\u25BA'}
        </Text>
        <Text style={{ fontSize: 18, fontFamily: 'vestas-sans-book' }}>{item.value}</Text>
        {item.sublist && renderList(item.sublist, `${keyPrefix}-${index}`, useLetters)}
      </View>
    ));
  };

  const currentSubtask = task.subtask[currentSubtaskIndex];

  const getVideoSource = async (taskId) => {
    let r_data = await fetchCurrent(taskId);
    return r_data;
  };

  const handleSubtaskClick = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.seek(timestamp[0]);
    }
  };

  const storeInputValue = async () => {
    if (inputValue && inputValue.trim()) {
      try {
       
        const taskEnd = {
          taskId:  ["5.3.4.1"].includes(task?.id)  ? "5.3.4" : task?.id,
          subTaskId: ["5.3.4.1"].includes(task?.id) ? null : currentSubtaskIndex,
          measuredThickness: inputValue,
        };
        console.log(taskEnd)
        await updateCurrentTask(taskEnd);
      } catch (e) {
        console.error("Failed to save in AsyncStorage", e);
      }
    }
  };

  const getStoreInput = async (data) => {
    try {
      const taskData = {
        taskId: data ? data.id : task?.id,
        subTaskId: data ? data.subTaskid : currentSubtaskIndex,
      };
      let currentTask = await getCurrentTask(taskData);
      if (currentTask) {
        setInputValue(currentTask?.measuredThickness);
      }
    } catch (e) {
      console.error("Failed to get task from AsyncStorage", e);
    }
  }

 
  return (
    <Layout
      onBack={handleBack}
      onNext={handleNext}
      navigation={navigation}
      title={header}
      subTitle={subtitle}
      backButton={false}
      homeButton={true}
      isUserHeader={true}
      isShowSlide={true}
      pauseVideo={handleMenuPause}
    >
     <Modal
        visible={videoPopup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVideoPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalSubHeader}>Reference Video</Text> */}
            <Text style={styles.modalSubHeader}>{refVideoSource[task?.id]?.label}</Text>
            <VideoPlayer
                source={refVideoSource[task?.id]?.source}
              />         
            <TouchableOpacity style={styles.modalVideoButton} onPress={()=>setVideoPopup(false)} >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={loader}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVideoPopup(false)}
      >
        <View style={[styles.modalOverlay, {backgroundColor: 'rgba(69, 67, 61, 0.8)'}]}>
        <Image style={styles.modalImage} source={require('../assets/turbine.gif')} resizeMode="contain" />
        </View>
        
      </Modal>
        
      <Modal
        visible={modalShown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalShown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{labels.ChapterComponents.completionmodalheader}</Text>
            <Text style={styles.modalSubHeader}>{sectionTitle} {labels.ChapterComponents.completionmodalsubheader}</Text>
            <Image style={styles.modalImage} source={require('../assets/trophy-icon.png')} resizeMode="contain" />
            <TouchableOpacity style={styles.modalButton} onPress={handleNewTask} >
              <Text style={styles.modalButtonText}>{labels.ChapterComponents.newtask}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
          <CustomTitle
            sectionTitle={sectionTitle}
            sectionSubTitle={`${task.id} ${task.value}`}
            navigation={navigation}
            orientation={orientation}
          />
          {videoMode &&
            <View style={orientation === 'landscape' ? { marginTop: 5, height: 200 } : { height: 205 }}>
              <VideoPlayer
                ref={videoRef}
                source={currentData}
                onTimeUpdate={(time) => setCurrentTime(time)}
                onPlayPause = {handlePlayPause}
                onEnd={handleVideoEnd}
              />
            </View>
          }
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 80}
            style={{ flex: 1 }}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.container}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={handleManualScrollStart}
              onMomentumScrollEnd={handleManualScrollEnd}
              scrollEventThrottle={16}
            >

              {isWarningVisible && (
                <WarningModal
                  isVisible={isWarningVisible}
                  toggleModal={toggleWarningModal}
                  popup={task.popup}
                />
              )}


              {currentSubtaskIndex < 3 && !isFiveOneFive && !isFiveOneEight && !isFiveTwoTwo && !isFiveTwoOne && !isFiveThreeThree && !isRotor_thirteen && !isRotor_fourteen && task.warning && (
                <TouchableOpacity style={styles.warningContainer} onPress={toggleWarningModal}>
                  <Image
                    style={styles.warningImageIcon}
                    source={require("../assets/warning-icon.png")}
                    resizeMode="contain"
                  />
                  <Text style={styles.warningText}>{Array.isArray(task.warning) ? task.warning.map((w, i) => <Text key={`warning-${i}`}>{w.note}</Text>) : task.warning}</Text>
                </TouchableOpacity>
              )}
              {isFiveTwoOne && (
                <>
                  {task.warning.map((warning, index) => (
                    <View key={index} style={styles.warningContainer}>
                      <TouchableOpacity style={{ flexDirection: 'row', width: '80%' }} onPress={toggleWarningModal}>
                        <Image style={styles.warningImageIcon} source={require('../assets/warning-icon.png')} resizeMode="contain" />
                        <Text style={styles.warningText}>{warning.note}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {task.subtask.map((sub, index) => (
                    <TouchableOpacity
                      key={sub.id}
                      ref={(el) => (subtaskRefs.current[index] = el)}
                      onPress={() => handleSubtaskClick(sub.timestamp)}
                      style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}.`}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                      </View>
                      {sub.infobox.map((info, infoIndex) => (
                        <View key={infoIndex} style={styles.infoBox}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                          <Text style={styles.infoText}>{info.title}</Text>
                        </View>
                      ))}
                      {sub.list.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.infoListContainer}>
                          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                            <Text style={[styles.numText, { textAlign: 'left'}]}>{item.id}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5}]}>{item.value}</Text>
                          </View>
                          {item.infobox && item.infobox.map((info, infoIndex) => (
                            <View key={`info-${infoIndex}`} style={[styles.infoBox, { marginLeft: 30}]}>
                              <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                              <Text style={styles.infoText}>{info.title}</Text>
                            </View>
                          ))}
                          
                        </View>
                      ))}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {isFiveOneFive && (
                <>
                <TouchableOpacity style={styles.warningContainer} onPress={toggleWarningModal}>
                  <Image
                    style={styles.warningImageIcon}
                    source={require("../assets/warning-icon.png")}
                    resizeMode="contain"
                  />
                  <Text style={styles.warningText}>{Array.isArray(task.warning) ? task.warning.map((w, i) => <Text key={`warning-${i}`}>{w.note}</Text>) : task.warning}</Text>
                </TouchableOpacity>
                  {task.subtask.map((sub, index) => {
                    getHighlightedIndexForSnack(index)
                    return(
                      <TouchableOpacity
                      key={index}
                      ref={(el) => (subtaskRefs.current[index] = el)}
                      onPress={() => {handleSubtaskClick(sub.timestamp); getHighlightedIndexForSnack(index, sub.id)}}
                      style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                    > 
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}.`}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                      </View>
                      {sub.list && sub.list.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.subListContainer}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText, { textAlign: 'left' }]}>{labels.ChapterComponents.char}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                          </View>
                          {/* {index === 2 && (
                        <TouchableOpacity style={styles.warningContainer} onPress={toggleWarningModal}>
                          <Image style={styles.warningImageIcon} source={require('../assets/warning-icon.png')} resizeMode="contain" />
                          <Text style={styles.warningText}>{task.warning}</Text>
                        </TouchableOpacity>
                      )} */}
                        </View>
                      ))}
                      {index === 5 && (
                        <View style={styles.warningBox}>
                          <Image style={styles.warningTitleIcon} source={require('../assets/warning-icon-2.png')} resizeMode="contain" />
                          <Text style={styles.warningTitle}>{task.caution.title}</Text>
                        </View>
                      )}
                      {index === 5 && task.caution.list.map((info, infoIndex) => (
                        <View key={infoIndex} style={styles.bulletPointContainer}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.bulletText}>{info.value}</Text>
                        </View>
                      ))}
                      {/* {sub.infobox && sub.infobox.map((info, infoIndex) => (
                        <View key={infoIndex} style={styles.infoBox}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                          <Text key={infoIndex} style={styles.infoText}>{info}</Text>          
                        </View>
                      ))} */}
                      {sub.infobox && sub.infobox.map((info, infoIndex) => (
                        <>
                        <View key={infoIndex} style={styles.infoBox}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                          <Text style={styles.infoText}>{info.title}</Text>
                        </View>
                        {sub?.isRefVideo && infoIndex==0 &&(
                          <View>
                          <Image style={styles.videoIcon} source={require('../assets/video.png')} />
                        </View>
                        )
                        
                        }
                        </>
                      ))}
                    </TouchableOpacity>
                    )
                    
})}
                </>
              )}

              {isFiveOneEight && (
                <>
                <TouchableOpacity style={styles.warningContainer} onPress={toggleWarningModal}>
                  <Image
                    style={styles.warningImageIcon}
                    source={require("../assets/warning-icon.png")}
                    resizeMode="contain"
                  />
                  <Text style={styles.warningText}>{Array.isArray(task.warning) ? task.warning.map((w, i) => <Text key={`warning-${i}`}>{w.note}</Text>) : task.warning}</Text>
                </TouchableOpacity>
                  {task.subtask.map((sub, index) => (
                    <TouchableOpacity
                      key={sub.id}
                      ref={(el) => (subtaskRefs.current[index] = el)}
                      onPress={() => handleSubtaskClick(sub.timestamp)}
                      style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}.`}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                      </View>
                      {sub.list && sub.list.map((item, itemIndex) => (
                        <View key={item.id} style={styles.subListContainer}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText, { textAlign: 'left' }]}>{labels.ChapterComponents.char}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                          </View>
                        </View>
                      ))}
                      {index === 9 && (
                        <View style={styles.warningBox}>
                          <Image style={styles.warningTitleIcon} source={require('../assets/warning-icon-2.png')} resizeMode="contain" />
                          <Text style={styles.warningTitle}>{task.caution.title}</Text>
                        </View>
                      )}
                      {index === 9 && task.caution.list.map((info, infoIndex) => (
                        <View key={infoIndex} style={styles.bulletPointContainer}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.bulletText}>{info.value}</Text>
                        </View>
                      ))}
                      {sub.infobox && sub.infobox.map((info, infoIndex) => (
                        <View key={infoIndex} style={styles.infoBox}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                          <Text key={infoIndex} style={styles.infoText}>{info}</Text>
                        </View>
                      ))}
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {!isFiveOneFive && !isFiveOneEight && !isFiveTwoOne && !isFiveTwoTwo && !isFiveThreeThree && !isFiveThreeThreeOne && !isFiveFourOne && !isFiveOneOne && !isRotor_thirteen && !isRotor_fourteen && (
                <>
                  {task.id === "5.3.1" && (
                      <View style={styles.infoBoxContainer}>
                          <Image style={[styles.infoIcon, {marginLeft: 20}]} source={require('../assets/info-icon.png')} />
                          <Text style={styles.infoText}>{task.infobox[0].title}</Text>
                      </View>
                  )}
                  {task.subtask.map((sub, index) => {
                     getHighlightedIndexForSnack(index);
                    return(
                      <TouchableOpacity
                      key={sub.id}
                      ref={(el) => (subtaskRefs.current[index] = el)}
                      onPress={() => {handleSubtaskClick(sub.timestamp);getHighlightedIndexForSnack(index, sub.id)}}
                      style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}.`}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                      </View>
                      {sub?.isRefVideo && (
                          <View>
                          <Image style={styles.videoIcon3} source={require('../assets/video.png')} />
                        </View>
                        )}
                      {sub.list && sub.list.map((item, itemIndex) => (
                        <View key={item.id} style={styles.subListContainer}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.bulletPoint, { textAlign: 'left' }]}>{`\u25BA `}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                          </View>
                        </View>
                      ))}
                      {sub.infobox && sub.infobox.map((info, infoIndex) => (
                        <View key={infoIndex} style={styles.infoBox}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                          <Text key={infoIndex} style={styles.infoText}>{info}</Text>
                        </View>
                      ))}
                    </TouchableOpacity>
                    )
                    
})}
                </>
              )}

              {isFiveTwoTwo && (
                <>
                  {task.info && task.info[0] &&
                    <View style={[styles.infoBoxContainer]}>
                      <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} resizeMode="contain" />
                      <Text style={styles.infoText}> {task.info[0].title} </Text>
                    </View>
                  }
                  {task.subtask && task.subtask.map((sub, index) => (
                    <TouchableOpacity
                      key={sub.id}
                      ref={(el) => (subtaskRefs.current[index] = el)}
                      onPress={() => handleSubtaskClick(sub.timestamp)}
                      style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}.`}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                      </View>
                      {sub.list && sub.list.map((item, itemIndex) => (
                        <View key={`item-${sub.id}-${item.id}-${itemIndex}`} style={styles.infoListContainer}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText, { textAlign: 'left' }]}>{item.index}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                          </View>
                          {item.sublist && item.sublist.map((nesteditem, nesteditemIndex) => (
                              <View key={`nesteditem-${sub.id}-${item.id}-${nesteditem.id}-${nesteditemIndex}`} style={{ flexDirection: 'row', marginTop: 5, marginLeft: 20 }}>
                                <Text style={[styles.numText]}>{`\u25BA `}</Text>
                                <Text style={[styles.checkText, { marginLeft: 5 }]}>{nesteditem.value}</Text>
                              </View>
                          ))}
                        </View>
                      ))}

                    </TouchableOpacity>
                  ))}
                  <ImagePicker taskData={task} from={new Date()} />
                </>
              )}
              {isFiveThreeThree && (
                <>
                  {task.subtask.map((sub, index) => (
                    <TouchableOpacity
                      key={index}
                      ref={(el) => (subtaskRefs.current[index] = el)}
                      onPress={() => handleSubtaskClick(sub.timestamp)}
                      style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}. `}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                      </View>
                      {/* {sub.infobox.length > 0 && sub.infobox.map((info, infoIndex) => (
                        <View key={infoIndex} style={[styles.infoBox]}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} resizeMode="contain" />
                          <Text style={styles.infoText}>{info}</Text>
                        </View>
                      ))} */}
                      {sub.infobox && sub.infobox.map((info, infoIndex) => (
                        <View key={infoIndex} style={[styles.infoBox]}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} resizeMode="contain" />
                          <Text style={styles.infoText}>{info}</Text>
                        </View>
                      ))}
                      {sub.list.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.subListContainer}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText, { textAlign: 'left' }]}>{item.index}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                        </View>
                        </View>
                      ))}                     
                      {sub.id === 3 && sub.list.map((step, stepIndex) => (
                        <View key={step.id}>
                          <View style={{ marginLeft: 20, flexDirection: 'row', alignItems: 'center' }}>
                            {/* <Text style={[styles.numText]}>{step.index}</Text>
                        <Text style={[styles.checkText]}>{step.value}</Text> */}
                          </View>
                        </View>
                      ))}
                    </TouchableOpacity>
                  ))}
                  <ImagePicker taskData={task} from={new Date()} />
                </>
              )}

              {isFiveThreeThreeOne && (
                <>
                  {task.subtask.map((sub, index) => {
                    getHighlightedIndexForSnack(index);
                    return sub?.value &&  (
                      
                      <TouchableOpacity
                      key={index}
                      ref={(el) => (subtaskRefs.current[index] = el)}
                      onPress={() => {handleSubtaskClick(sub.timestamp);getHighlightedIndexForSnack(index, sub.id)}}
                      style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}.`}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                      </View>
                      {sub.inputfields && sub.inputfields.map((field, i) => (
                        <View key={`input-field-${i}`}>
                          <TextInput
                            style={styles.input}
                            placeholder={labels.ChapterComponents.textinputplaceholder}
                            value={inputValue}
                            onFocus={handleTextInputFocus}
                            onBlur={() => {
                              handleTextInputBlur();
                            }}
                            onChangeText={handleInputChange}
                            autoCorrect={false}
                            textContentType='none'
                            autoComplete="off"
                            keyboardType='email-address'
                          />
                        </View>
                      ))}
                      {sub.infobox && sub.infobox.map((info, infoIndex) => (
                        <View key={`info-box-${infoIndex}`} style={styles.infoBox}>
                          <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                          <Text style={styles.infoText}>{info}</Text>
                        </View>
                      ))}
                      {sub.list && sub.list.map((item, itemIndex) => (
                        <>
                        <View key={`list-item-${itemIndex}`} style={styles.subListContainer}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText, { textAlign: 'left' }]}>{item.index}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                          </View>
                        </View>
                        {sub?.isRefVideo && itemIndex==1 && (
                          <View>
                          <Image style={styles.videoIcon2} source={require('../assets/video.png')} />
                        </View>
                        )}
                        </>
                      ))}
                    </TouchableOpacity>
                    )
                    
})}
                </>
              )}

              {isFiveFourOne && (
                <>
                  {task.subtask.map((sub, index) => (
                    index === 0 && (
                      <TouchableOpacity
                        key={sub.id}
                        ref={(el) => (subtaskRefs.current[index] = el)}
                        onPress={() => handleSubtaskClick(sub.timestamp)}
                        style={[styles.subTaskContainer, getHighlightedIndex() === index ? styles.highlightedText : null]}
                      >
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.numText, { textAlign: 'left' }]}>{`${index + 1}.`}</Text>
                          <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                        </View>

                        {task.subtask[0].list.map((sub, index) => (
                          index === 0 && (
                            <View key={sub.id} style={{ flexDirection: 'row', marginLeft: 20, marginTop: 5 }}>
                              <Text style={[styles.numText]}>{`\u25BA `}</Text>
                              <Text style={[styles.checkText]}>{sub.value}</Text>
                            </View>
                          )
                        ))}
                      </TouchableOpacity>
                    )
                  ))}
                  <ImagePicker taskData={task} from={new Date()} />
                </>
              )}

              {isFiveOneOne && currentSubtask && (
                <>
                  {currentSubtaskIndex < task.subtask.length && (
                    <TouchableOpacity
                      onPress={() => { handleSubtaskClick(task.subtask[currentSubtaskIndex].timestamp) }}
                      style={[styles.subTaskContainer, getHighlightedIndex() === currentSubtaskIndex ? styles.highlightedText : null]}
                    >

                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.numText]}>{`${currentSubtaskIndex + 1}.`}</Text>
                        <Text style={[styles.checkText, { marginLeft: 5 }]}>{task.subtask[currentSubtaskIndex].value}</Text>
                      </View>

                    </TouchableOpacity>
                  )}
                </>
              )}

              {isRotor_thirteen && currentSubtaskIndex <= 1 && (
                <>
                  {currentSubtaskIndex <= 1 && task.subtask && task.subtask.map((sub, index) => {
                    const ishighlighted = getHighlightedIndex() === index;
                    if (currentSubtaskIndex == 0 && sub.id == 0) {
                      return (
                        <TouchableOpacity
                          key={`${sub.id}-${index}`}
                          ref={(el) => (subtaskRefs.current[index] = el)}
                          // onPress={() => { handleSubtaskClick(task.subtask[currentSubtaskIndex].timestamp) }}
                          onPress={() => handleSubtaskClick(sub.timestamp)}
                          style={[styles.subTaskContainer, ishighlighted ? styles.highlightedText : null]}
                        >
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText]}>{`${currentSubtaskIndex + 1}.`}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                          </View>
                          {sub.list && sub.list.map((item, itemIndex) => (
                            <View>
                            <View key={item.id} style={styles.subListContainer}>
                              <View style={{ flexDirection: 'row' }}>
                                <Text style={[styles.numText, { textAlign: 'left' }]}>{item.index}.</Text>
                                <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                              </View>
                             
                            </View>
                             {item?.info && item?.info.map((info, infoIndex) => (
                              <View key={infoIndex} style={styles.infoBox}>
                                <Image style={styles.infoIcon} source={require('../assets/info-icon.png')} />
                                <Text key={infoIndex} style={styles.infoText}>{info.title}</Text>
                              </View>
                            )) }
                            </View>
                          ))}

                        </TouchableOpacity>
                      )

                    }
                    if (currentSubtaskIndex == 1 && sub.id != 0) {
                      return (
                        <TouchableOpacity
                          key={`${sub.id}-${index}`}
                          ref={(el) => (subtaskRefs.current[index] = el)}
                          onPress={() => handleSubtaskClick(sub.timestamp)}
                          style={[styles.subTaskContainer, ishighlighted ? styles.highlightedText : null]}
                        >
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText]}>{`${index + 1}.`}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                          </View>
                          {index == 3 && (
                            <View key={`input-field-${index}`}>
                              <TextInput
                                style={styles.input}
                                placeholder={labels.ChapterComponents.textinput_placeholder_5_6_13}
                                value={inputValue}
                                onFocus={handleTextInputFocus}
                                onBlur={handleTextInputBlur}
                                onChangeText={handleInputChange}
                                autoCorrect={false}
                                textContentType='none'
                                autoComplete="off"
                                keyboardType='email-address'
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      )

                    }
                  }

                  )}

                </>
              )}

              {isRotor_fourteen && currentSubtaskIndex <= 1 && (
                <>
                  {currentSubtaskIndex <= 1 && task.tasks && task.tasks.map((sub, index) => {
                    const ishighlighted = getHighlightedIndex() === index;
                    if (currentSubtaskIndex == 0 && sub.id == 0) {
                      return (
                        <TouchableOpacity
                          key={`${sub.id}-${index}`}
                          ref={(el) => (subtaskRefs.current[index] = el)}
                          onPress={() => handleSubtaskClick(sub.timestamp)}
                          style={[styles.subTaskContainer, ishighlighted ? styles.highlightedText : null]}
                        >
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText]}>{`${currentSubtaskIndex + 1}.`}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                          </View>

                        </TouchableOpacity>
                      )

                    }
                    if (currentSubtaskIndex == 1 && sub.id == 1) {
                      return (
                        <View key={`${sub.id}-${index}`}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.numText]}>{`${currentSubtaskIndex + 1}.`}</Text>
                            <Text style={[styles.checkText, { marginLeft: 5 }]}>{sub.value}</Text>
                          </View>
                          {sub.id == 1 && task.subtask && task.subtask.map((item, itemIndex) => (
                            <TouchableOpacity key={item.id}
                              onPress={() => { handleSubtaskClick(task.tasks[currentSubtaskIndex].timestamp) }}
                              style={styles.subTaskContainer}
                            >
                              <View key={item.id} style={styles.subListContainer}>
                                <View style={{ flexDirection: 'row' }}>
                                  <Text style={[styles.numText, { textAlign: 'left' }]}>{itemIndex + 1}</Text>
                                  <Text style={[styles.checkText, { marginLeft: 5 }]}>{item.value}</Text>
                                </View>
                              </View>
                              {item?.list?.length > 0 && item?.list.map((listItem, listItemIndex) => (
                                    // <View key={listItemIndex} style={styles.subListContainer}>
                                    //   <View style={{ flexDirection: 'row' }}>
                                    //     <Text style={[styles.bulletPoint, { textAlign: 'left' }]}>{`\u25BA `}</Text>
                                    //     <Text style={[styles.checkText, { marginLeft: 5 }]}>{listItem.value}</Text>
                                    //   </View>
                                    // </View>
                                    <View key={listItem.id} style={{ display:"flex" , flexDirection: 'row',marginLeft: 20, marginTop: 5 }}>
                              <Text style={[styles.numText]}>{`\u25BA `}</Text>
                              <Text style={[styles.checkText]}>{listItem.value}</Text>
                            </View>
                                  ))}
                            </TouchableOpacity>

                          ))}

                          <View key={`input-field-${sub.id}`}>
                            <TextInput
                              style={styles.input}
                              placeholder={labels.ChapterComponents.textinput_placeholder_5_6_14}
                              value={inputValue}
                              onFocus={handleTextInputFocus}
                              onBlur={handleTextInputBlur}
                              onChangeText={handleInputChange}
                              autoCorrect={false}
                              textContentType='none'
                              autoComplete="off"
                              keyboardType='email-address'
                            />
                          </View>

                        </View>
                      )
                    }
                  }

                  )}

                </>
              )}
              {(task?.checkSkipped !== true && !isFiveThreeThree && orientation == "landscape") && (
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={isStepVerified}
                    onValueChange={handleCheckBoxChange}
                    color={isStepVerified ? '#4ba6f7' : undefined}
                  />
                  <Text onPress={() => handleCheckBoxChange(!isStepVerified)} style={styles.checkboxText}>Step verified complete</Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
      {(task?.checkSkipped !== true && !isFiveThreeThree && orientation == "portrait") && (
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isStepVerified}
            onValueChange={() => handleCheckBoxChange(!isStepVerified)}
            color={isStepVerified ? '#4ba6f7' : undefined}
          />
          <Text onPress={() => handleCheckBoxChange(!isStepVerified)} style={styles.checkboxText}>Step verified complete</Text>
        </View>
      )}
    </Layout>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5
  },
  subHeading: {
    fontSize: 20,
    marginBottom: 20,
    marginLeft: 25,
    paddingRight: 10,
    fontFamily: 'vestas-sans-book',
  },
  warningContainer: {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
    backgroundColor: "#ffffff",
    padding: 20,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 15
  },
  warningImageIcon: {
    width: 30,
    height: 30,
    alignSelf: 'flex-start'
  },
  warningText: {
    marginLeft: 5,
    color: 'black',
    textAlign: 'left',
    fontSize: 18,
    fontFamily: 'vestas-sans-semibold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  modalContentVideoRef: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  modalHeader: {
    fontSize: 24,
    fontFamily: 'vestas-sans-semibold',
    textAlign: 'center',
    marginBottom: 10,
    paddingTop: 20
  },
  modalSubHeader: {
    fontSize: 20,
    color: '#3c3c3c',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'vestas-sans-medium',
  },
  modalImage: {
    width: 100,
    height: 80,
    alignSelf: 'center',
    marginTop: 10
  },
  modalButton: {
    backgroundColor: '#4BA6F7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 80,
    marginBottom: 25,
    alignSelf: 'center',
  },
  modalVideoButton: {
    backgroundColor: '#4BA6F7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'vestas-sans-book',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    height: 400,
  },
  modalTitle: {
    fontFamily: 'vestas-sans-semibold',
    fontSize: 18,
    marginVertical: 10,
  },
  warningImage: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  acknowldgeButton: {
    backgroundColor: '#2F4256',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 4,
    marginTop: 70,
    marginBottom: 25,
    alignSelf: 'center',
  },
  acknowldgeText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'vestas-sans-book',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'vestas-sans-book',
  },
  checkText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'vestas-sans-book',
    lineHeight: 22
  },
  highlightedText: {
    borderTopWidth: 1,
    borderBottomWidth: 3,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#4BA6F7',
    backgroundColor: '#ffffff',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderRadius: 4,
  },
  numText: {
    fontSize: 18,
    marginBottom: 20,
    marginLeft: 20,
    fontFamily: 'vestas-sans-book',
    lineHeight: 22
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 40,
    marginRight: 30,
    marginBottom: 20
  },
  warningTitleIcon: {
    width: 20,
    height: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontFamily: 'vestas-sans-semibold',
    marginLeft: 10,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 55,
    marginRight: 25
  },
  
  bulletText: {
    fontSize: 18,
    marginLeft: 5,
    fontFamily: 'vestas-sans-book',
    lineHeight: 22
  },
  warningContainerColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    padding: 10,
    marginLeft: 35,
  },
  taskComplete: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 10,
    justifyContent: 'center',
    height: 350,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    height: 400,
  },
  modalTitle: {
    fontFamily: 'vestas-sans-semibold',
    fontSize: 18,
    marginVertical: 10,
  },
  warningImage: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  acknowldgeButton: {
    backgroundColor: '#2F4256',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 4,
    marginTop: 70,
    marginBottom: 25,
    alignSelf: 'center',
  },
  acknowldgeText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'vestas-sans-book',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'vestas-sans-book',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginVertical: 10,
    marginLeft: 30,
    padding: 10,
    margin: 10,
    backgroundColor: "#ffffff"
  },
  infoBoxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginLeft: 20,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff"
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 3
  },
  videoIcon: {
    width: 25,
    height: 25,
    marginLeft: 40,
    marginTop: -45
  },
  videoIcon2: {
    width: 25,
    height: 25,
    marginLeft: 25,
    marginTop: -25
  },
  videoIcon3: {
    width: 25,
    height: 25,
    marginLeft: 10,
    marginTop: -25
  },
  infoText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'vestas-sans-book',
    marginRight: 10,
    lineHeight: 22
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10
  },
  warningTitleIcon: {
    width: 20,
    height: 20
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 40,
    width: "80%",
    marginBottom: 5
  },
  bulletPoint: {
    fontSize: 18,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 5,
    fontFamily: 'vestas-sans-book',
  },
  warningContainerColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    padding: 10,
    marginLeft: 35,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'grey',
    marginVertical: 20,
    backgroundColor: '#fff',
    fontSize: 10,
    width: "83%",
    marginLeft: 20,
    alignSelf: "center"
  },
  subTaskContainer: {
    backgroundColor: "#ffffff",
    justifyContent: "flex-start",
    paddingHorizontal: 3,
    paddingVertical: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10
  },
  subListContainer: {
    marginTop: 15,
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoListContainer: {
    marginTop: 15,
    marginLeft: 20,
    alignItems: 'center'
  },
  highlightedStep: {
    backgroundColor: 'red',
  },
});

export default TaskComponent;