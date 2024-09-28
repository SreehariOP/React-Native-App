import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, Alert, Switch } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { NavigationContext } from './NavigationContext';
import { getTimeStamp } from "../util/timeStamp";
import { useDrawerStatus } from '@react-navigation/drawer';
import updateTaskAsyncStorage from '../util/task-async-storage';
import { systemStatus } from '../constants/systemModule';
import { getCurrentTurbineInstance, setCurrentTurbineInstance, userData, setLogOut } from '../util/asyncUtils';
import Dialog from "react-native-dialog";
import { LanguageContext } from "../Shared/languageContext";

const CustomSidebar = () => {
  
  const navigation = useNavigation();
  const { currentSection, setLastScreen, setFromSidebar, navigationTargets, currentTask, sideBarConfig, setSideBarConfig, videoMode, setVideoMode } = useContext(NavigationContext)
  const [data, setData] = useState([]);
  const [initals , setInitals] = useState('');
  const isDrawerOpen = useDrawerStatus();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [switchEnabled, setSwitchEnabled] = useState(true);
  const { labels, systemContent } = useContext(LanguageContext);
  const {setIsAuthendicated} = useContext(NavigationContext);

  const handleClosePress = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const getSectionDetail = () => {    
    const sectionDetail = systemContent.content?.find(y => y.id === currentSection);  
    return sectionDetail ? `${sectionDetail.id} ${sectionDetail.value}` : "Section Details";
  };

  const navigateToIntro = () =>{
    navigation.navigate('IntroScreen', navigation , {canGoBack : true});
    setSideBarConfig('introScreen')
  }

  const navigateToActivity = () =>{
    navigation.navigate('ActivityScreen');
    setSideBarConfig('activity')
  }

  useEffect(() => {
    const fetchTimeStamps = async () => {
      try {
        const targets = getFilteredTargets();

        const states = await Promise.all(
          Object.keys(targets).map(async id => {
            let obj = {
              id : id.split(' ')[0],
              title : targets[id],
              status : await getTimeStamp(id.split(' ')[0])
            };
            return obj;
          })
        );
        setData(states);
      } catch (error) {
        console.error('Error fetching timestamps:', error);
      }
    };
    if(isDrawerOpen == "open"){
      getInitals()
      fetchTimeStamps();

    }
  }, [currentSection, navigationTargets, isDrawerOpen]);
  
  const handleNavigate = (taskID) => {
    const yawSystemDetail = systemContent?.content.find(y => y.id === taskID.substring(0, 3));
    if (!yawSystemDetail) {
      console.error('No yaw system detail found for task ID:', taskID);
      return;
    }
    const taskDetail = yawSystemDetail.task.find(t => t.id === taskID);
    const targetScreen = navigationTargets[taskID];
    if (targetScreen == "TaskComponent") {
      let task = {
        "isResume": true,
        "currentTaskId": taskDetail.id,
        "currentSubTaskId": ["5.4.2" ,"5.1.5" ,"5.1.8" ,"5.2.2" ,'5.2.1',"5.3.1","5.3.2","5.3.3","5.3.4"].includes(taskDetail.id) ? null : taskDetail.subtask[0].id,
        "startTime": Date.now(),
      };
      updateTaskAsyncStorage('my-key', task).then(async(res)=>{
        if(res){
          navigation.navigate(targetScreen, { task: taskDetail, sectionTitle: `${yawSystemDetail.id} ${yawSystemDetail.value}` });
        }
      }).catch((e)=>{
        console.log("Error Syncing!", e)
      });
      
    } else {
      navigation.navigate(targetScreen, { task: taskDetail, sectionTitle: `${yawSystemDetail.id} ${yawSystemDetail.value}` });
    }
  };

  const getFilteredTargets = () => {
    const yawSystemDetail = systemContent.content.find(y => y.id === currentSection.substring(0, 3));
   if (!yawSystemDetail) {
      // console.error('No system detail found for section ID:', currentSection);
      return {};
    }

    return Object.keys(navigationTargets)
      .filter(key => key.startsWith(currentSection))
      .reduce((obj, key) => {
        const taskDetail = yawSystemDetail.task.find(t => t.id === key);
        if (taskDetail) {
          obj[key] = `${key} ${taskDetail.value}`;
        } else {
          obj[key] = key;
        }
        return obj;
      }, {});
  };

  cleanTask = async () => {
    const turbineInstance = await getCurrentTurbineInstance();
    turbineInstance.tasks = [];
    turbineInstance.overallPercentage = 0
    turbineInstance.module = turbineInstance.module.map(moduleItem => ({
      ...moduleItem,
      progressPercentage: 0
  }));
    await setCurrentTurbineInstance(turbineInstance)
    await setCurrentTurbineProgressState(systemStatus.NOT_STARTED)
    navigation.navigate('Home')
  }

  clickLogOut = async () => {
    try{
      const res = await setLogOut(true);
      setIsAuthendicated(false);
      // console.log('done logout: ', res);
      navigation.navigate('LoginScreen')
    }catch (err){
      console.error(err);
    }
  }

  getInitals = async () => {
    setInitals(await userData())
   
  }

  openESIF = () =>{
    navigation.navigate('EsifScreen', { activityEsif: false})
  }

  videoSwitchControl = () => {
    setSwitchEnabled(!switchEnabled);
    setVideoMode(!videoMode);
    setTimeout(()=>{
      console.log('switch: ', switchEnabled)
    }, 1000)
    
  }

  const navigateToHome = () => {
    // console.log(currentSection, "and", currentTask);
    const yawSystemDetail = systemContent.content.find(y => y.id === currentSection);
    const taskDetail = yawSystemDetail?.task.find(t => t.id === currentTask);
    setLastScreen({
      name: "TaskComponent", 
      params: { task: taskDetail, sectionTitle: `${currentSection} ${yawSystemDetail?.value}` }, 
    });
    setFromSidebar(true);
    navigation.navigate('Home', navigation);
  };
  return ( 
    <View style={styles.container}>
      <View>
        <Dialog.Container visible={confirmVisible}>
            <Dialog.Title>{labels.Sidebar.logout}</Dialog.Title>
              <Dialog.Description>
                {labels.Sidebar.logoutdesc}
              </Dialog.Description>
              <Dialog.Button label="Cancel" onPress={()=>setConfirmVisible(false)}/>
              <Dialog.Button color='red' label="Logout" onPress={()=>{setConfirmVisible(false);clickLogOut()}} />
        </Dialog.Container>
      </View>
      <View style={styles.headerMenu}>
        <Text style={styles.headerMenuText} > {labels.Sidebar.menu}</Text>
        <TouchableOpacity onPress={handleClosePress} style={{paddingLeft:'60%'}}>
          <Icon name="close" size={18}  style={styles.closeIcon}/>
        </TouchableOpacity>
      </View>

  
      
      {/* <View style={styles.boxStart}>
      
      <View style={styles.profile}>
           <Text  style={[styles.title,{ paddingLeft: 10}]} >{initals}</Text>
         </View>
         <View style={{paddingLeft: '50%'}}>
         <Image source={require('../assets/black-profile.png')}  resizeMode="contain"  />
         </View>
        
      </View> */}
      <View style={{ marginTop : 5 }}>
        <View style={styles.box}>
        
          <Text style={styles.title}>{initals.replace(/['"]/g, '')}</Text>
          <View style={{paddingLeft: '60%'}}>
         <Image source={require('../assets/User_Icon002.png')}  resizeMode="contain" style={{width : 30, height:30  }}/>
         </View>
        </View>
      </View>
      
      <TouchableOpacity onPress={navigateToHome} style={[{ marginTop : 5 }, sideBarConfig === 'chapterComponent' ? {display:'block'} : {display:'none'}]} >
        <View style={styles.box}>
        <Image source={require('../assets/Extn_Arrow.png')}  resizeMode="contain" style={styles.leftArrow}/>  
          <Text style={styles.title}>{labels.Sidebar.abbreviation}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {openESIF();}} style={[{ marginTop : 5 }, (sideBarConfig != 'activity' && sideBarConfig != 'sif') ? {display:'block'} : {display:'none'}]}>
        <View style={styles.box}>
        <Image source={require('../assets/Extn_Arrow.png')}  resizeMode="contain" style={styles.leftArrow}/>    
          <Text style={styles.title}>{labels.footer.esif}</Text>
        </View>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={() => cleanTask()} style={[{ marginTop : 5 }, sideBarConfig != 'activity' ? {display:'block'} : {display:'none'}]}>
        <View style={styles.box}>
        <Image source={require('../assets/Extn_Arrow.png')}  resizeMode="contain" style={styles.leftArrow}/>   
          <Text style={styles.title}>{labels.Sidebar.cache}</Text>
        </View>
      </TouchableOpacity> */}
      <TouchableOpacity onPress={() => navigateToActivity()} style={[{ marginTop : 5 }, sideBarConfig != 'activity' ? {display:'block'} : {display:'none'}]}>
        <View style={styles.box}>
        <Image source={require('../assets/Extn_Arrow.png')}  resizeMode="contain" style={styles.leftArrow}/>   
          <Text style={styles.title}>Activity Overview</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=> navigateToIntro()} style={[{ marginTop : 5 }, sideBarConfig != 'activity' ? {display:'block'} : {display:'none'}]}>
        <View style={styles.box}>
       <Image source={require('../assets/Extn_Arrow.png')}  resizeMode="contain" style={styles.leftArrow}/>    
          <Text style={styles.title}>{labels.Sidebar.activityoverview}</Text>
        </View>
      </TouchableOpacity>
      <View style={{ marginTop : 5 }}>
      
        <View style={styles.box}>
        <Text style={styles.title}>{labels.Sidebar.videomode}</Text>
         <View style={{paddingLeft: '30%'}}>
         <Switch 
            trackColor={{false: '#d9d8d4', true: '#4BA6F7'}}
            thumbColor={switchEnabled ? '#f5f4ed' : '#f4f3f4'}
            ios_backgroundColor="#d9d8d4"
            onValueChange={()=>videoSwitchControl()}
            value={switchEnabled}
          />
         </View>
          
      </View>
    </View>
      <TouchableOpacity onPress={() => setConfirmVisible(true)} style={{ marginTop : 5 }}>
        <View style={styles.box}>
        
          <Text style={styles.title}>{labels.Sidebar.logout}</Text>
          <View style={{paddingLeft: '40%'}}>
         <Image source={require('../assets/Logout.png')}  resizeMode="contain" style={{width : 30, height:30  }}/>
         </View>
        </View>
      </TouchableOpacity>
      <View style={styles.gap} />
      <View style={sideBarConfig == 'chapterComponent' ? {display:'block'} : 
                    {display:'none'}}>
      <View style={styles.summaryContainer}>
        <Text style={styles.header}>{labels.Sidebar.summary}</Text>
      </View>
      <Text style={styles.sectionHeader}>{getSectionDetail()}</Text>
      <View style={{height:380}}>
      <ScrollView style={{marginBottom: '50%'}}
      bounces={true}>
      {data.map((detail, index) => (
        <TouchableOpacity
          key={detail.id}
          style={styles.item}
          onPress={() => handleNavigate(detail.id)}
        >
          <View style={styles.titleContainer}>
            <View style={[
              styles.statusBar, 
              detail.status === "success" ? { backgroundColor: "#19736e" } : 
              detail.status === "progress" ? { backgroundColor: "#e17d28" } : 
              {}
            ]}></View>
            <Text style={styles.chapterTitle}>{detail.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
      </ScrollView>
      </View>
      
      </View>
    </View>
  );
};

export default CustomSidebar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingTop: 20,
    backgroundColor: '#eaebe6'
  },
  chapters: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height : 65,
    marginBottom : 7
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeIcon: {
    color: 'white',
    padding:5,
    marginRight : 20
  },
  boxStart : {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f7f7f7',
    width: '90%',
    alignSelf: 'center'
   
  },
  box: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    //borderWidth: 1,
    //borderColor: 'lightgrey',
    //borderRadius: 8,
    padding: 10,
    backgroundColor: '#f7f7f7',
    width: '95%',
    alignSelf: 'center'
  },
  headerMenu:{
    backgroundColor: '#4BA6F7',
    flexDirection: 'row',
    //alignSelf: 'center',
    alignItems: 'center',
    padding: 10
    
  },
  headerMenuText: {
    fontSize: 18,
    padding: 10,
    color: 'white',
    float: 'left'
  },
  title: {
    fontSize: 18,
    paddingLeft: 10,
    paddingTop:4,
    fontFamily: 'vestas-sans-medium',
  },
  chapterTitle: {
    flex: 1,
    fontSize: 16,
    color: '#3c3c3c',
    fontFamily: 'vestas-sans-medium',
    paddingLeft: 10
  },
  header: {
    fontSize: 18,
    fontFamily: 'vestas-sans-semibold',
    marginVertical: 20,
    textAlign: 'left',
    paddingLeft: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'vestas-sans-semibold',
    paddingLeft: 10,
    paddingBottom: 10
  },
  bulletPoint: {
    fontSize: 25,
    color: 'lightgrey',
    width: 30,
    lineHeight: 35,
    alignItems: 'flex-start'
  },
  icon: {
    color: '#000'
  },
  leftArrow: {
    width : 18, 
    height:18
  },
  gap: {
    height: 7,
    backgroundColor: 'lightgrey',
    marginTop: 20
  },
  profile: { 
    color: 'black',
    alignItems: "center"
  },
  item : {
    alignItems: "center",
    height : 67,
    backgroundColor : "#ffffff",
    borderBottomWidth : 7,
    borderBlockColor : "#d3d3d3"
  },
  titleContainer : {     
    flex: 1,
    flexDirection: "row", 
    alignItems : "center"
  },
  statusBar : { 
    width : 10, 
    height : 60
  }
});