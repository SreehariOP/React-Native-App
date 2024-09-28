import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

// Componenets
import Layout from "../Layout";
import VideoPlayer from "../Shared/videoPlayerPoc";
import WarningContext from "../Shared/warningContext";

// Datas or Values or Functions
import { getTimeStampDone , getProgressTask } from '../util/timeStamp';
import { NavigationContext } from '../Shared/NavigationContext';
import { getCurrentTurbineInstance, setCurrentTurbineProgressState } from "../util/asyncUtils";
import { systemStatus } from "../constants/systemModule";
import { LanguageContext } from "../Shared/languageContext";

import { dataSet } from "../assets/config/sourceConfig";

import { getCurrent } from "../util/asyncUtils";

const IntroScreen = ({ navigation, route }) => {
  const { labels, systemContent, abbreviation } = useContext(LanguageContext);
  const isFocused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const { hasWarningBeenShown, showWarning } = useContext(WarningContext);
  const {sideBarConfig, setSideBarConfig, videoMode, currentSection, currentTask, currentSystem, selectedLanguage } = useContext(NavigationContext)

  const [data, setData] = useState([]);
  const [orientation, setOrientation] = useState("portrait");
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);
  const [taskProgress, setTaskProgress] = useState({});
  const [introVideo, setIntroVideo] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);

  const fetchCurrent = async() =>{
    let _data = await getCurrent();
    setTitle(dataSet[_data?.id][_data?.lang]["abbrevation"]["HeaderTitle"])
    setSubtitle(dataSet[_data?.id][_data?.lang]["abbrevation"]["subtitle"])
    setIntroVideo(dataSet[_data?.id][_data?.lang].videos.intro)
  }


  useEffect(() =>{
    if(isFocused){
      fetchCurrent();
    if(sideBarConfig !== 'introScreen')
    setSideBarConfig('introScreen');
      checkStatus();
    }
  }, [isFocused])

  useEffect(() =>{
    if (width < height) {
      setOrientation("portrait")
    } else {
      setOrientation("landscape")
    }
  }, [width, height])

  const checkStatus = async () =>{
    let array = systemContent.content;
    
    const turbineInstance = await getCurrentTurbineInstance();
    
    array = await Promise.all(array.map(async (detail) => {
      
      let stampSate = await getTimeStampDone([detail.id],turbineInstance);
      detail['status'] = stampSate;
      return detail;
    }));
   
    setData(array);
    
    setAllTasksCompleted(array.every(item => item.status[item.id] === "completed"));


    const progressPromises = array?.map(async (a) => {
      const progress = await getProgressTask(a.id,turbineInstance);

      return { id: a.id, progress };
    });
    
    
    const progressArray = await Promise.all(progressPromises);
    
    const progressMap = progressArray.reduce((acc, { id, progress }) => {
      acc[id] = progress;
      return acc;
    }, {});

    setTaskProgress(pre => pre = progressMap);
  };

  const handleMenuPause= () => {
    if(videoRef.current){
      videoRef.current.pause();
    }
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePress = (item) => {
    videoRef.current.pause();
    navigation.navigate('FiveChapters', { details: item.task.filter(z=> !z?.hidden).map(a=> a.id+" " +a.value), title: item.id+" " +item.value,  id: route?.params?.system?.id, lang: route?.params?.lang});
  };

  const handleEsifPress = () => {
    setSideBarConfig('sif');
    navigation.navigate('EsifScreen', { activityEsif: false});
  };

  return (
    <Layout 
      navigation={navigation}
      onBack={() =>{navigation.navigate("Home");setSideBarConfig('homeScreen')}} 
      showMenu={false} 
      nextEnabled={false}
      onEsif={handleEsifPress}
      esifEnabled={allTasksCompleted}
      title={title} 
      subTitle={subtitle} 
      backButton={false}
      homeButton={true}
      pauseVideo= {handleMenuPause}
    >
      <ScrollView style={styles.container}>
        <View style={[orientation == "landscape" ? { marginTop : 20 } : {}, videoMode ? {display: 'block'}: {display: 'block'}, styles.videoContainer]}>
          <VideoPlayer ref={videoRef} source={introVideo} onTimeUpdate={() => {}} style={styles.videoPlayer}/>
        </View>
        <View >
          <Text style={styles.header}>{systemContent.header}</Text>
          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => handlePress(item)}
            >
              <View style={styles.titleContainer}>
              <View style={[
                    styles.statusBar,
                    item?.status[item?.id] === "completed" ? { backgroundColor: "#19736e" } :
                    item?.status[item?.id] === "inProgress" ? { backgroundColor: "#e17d28" } :
                    {}
                  ]}></View>
                <Text style={styles.title}>{item.id} {item.value}</Text>
              </View>
              <View style={styles.progress}>
                 <Text >  {taskProgress[item?.id]?.completed ?? 0} / {taskProgress[item?.id]?.total ?? 0}</Text>
              </View>
              <View style={styles.endStyle}>
                <Image
                  source={require("../assets/arrow.png")}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
  
  },
  videoContainer: {
    zIndex: 0, 
    overflow: 'hidden', 
    position: 'relative', 
    width: '100%', 
    height: 205, 
    backgroundColor: 'black', 
  },
  videoPlayer: {
    width: '100%', 
    height: '100%', 
    position: 'absolute', 
  },
  header: {
    fontSize: 24,
    fontWeight: "500",
    color: "#4ba6f7",
    marginLeft: 20,
    marginTop : 20,
    marginBottom : 20
  },
  item : {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height : 67,
    backgroundColor : "#ffffff",
    marginBottom : 7
  },
  titleContainer : {     
    flex: 1,
    flexDirection: "row", 
    alignItems : "center"
  },
  title : {
    marginLeft : 15,
    fontSize : 18,
    color : '#1f3144'
  },
  statusBar : { 
    width : 12, 
    height : 67
  },
  progress :{
    paddingHorizontal :5
  },
  endStyle : {
    marginRight : 15
  }
});

export default IntroScreen;
