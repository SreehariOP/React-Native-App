import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useIsFocused } from '@react-navigation/native';

// Componenets
import Layout from "../Layout";

// Datas or Values or Functions
import updateTaskAsyncStorage from "../util/task-async-storage";
import { getTimeStamp } from "../util/timeStamp";
import { NavigationContext } from '../Shared/NavigationContext';
import { LanguageContext } from "../Shared/languageContext";
import { getCurrent } from "../util/asyncUtils";
import { dataSet } from "../assets/config/sourceConfig";

const FiveChapters = ({ navigation, route }) => {
  const { labels, systemContent } = useContext(LanguageContext);
  const isFocused = useIsFocused();
  const { details, title } = route.params;
  const [data, setData] = useState([]);
  const {sideBarConfig, setSideBarConfig } = useContext(NavigationContext);
  const [header, setHeader] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const fetchCurrent = async() =>{
    let _data = await getCurrent();
    setHeader(dataSet[_data?.id][_data?.lang]["abbrevation"]["HeaderTitle"])
    setSubtitle(dataSet[_data?.id][_data?.lang]["abbrevation"]["subtitle"])
  }

  useEffect(()=>{
    fetchCurrent();
    setSideBarConfig('chapterOverview');
  },[navigation])

  useEffect(() =>{
    if(isFocused){
      checkStatus()
    }
  }, [isFocused])

  const checkStatus = async () =>{
    let array = await Promise.all(details.map(async (detail) => {
      const obj = {
        title: detail,
        status: await getTimeStamp(detail.split(" ")[0])
      };
      return obj;
    }));
    setData(array)
  };

  const handleNavigate = (detail) => {
    const taskID = detail.split(" ")[0];
    const yawSystemDetail = systemContent.content.find(
      (y) => y.id === taskID.substring(0, 3)
    );
    const taskDetail = yawSystemDetail.task.find((t) => t.id === taskID);
    const sectionTitle = yawSystemDetail.id + " " + yawSystemDetail.value;

    let task = {
      isResume: true,
      currentTaskId: taskDetail.id,
      currentSubTaskId: ["5.4.2" ,"5.1.5" ,"5.1.8" ,"5.2.2" ,'5.2.1',"5.3.1","5.3.2","5.3.3","5.3.4"].includes(taskDetail.id) ?   null
      : taskDetail.subtask[0].id,
      startTime: Date.now(),
    };

    updateTaskAsyncStorage("my-key", task).then((res)=>{
      if(res){
        navigation.navigate("TaskComponent", {
          task: taskDetail,
          sectionTitle: sectionTitle,
          id:route.params.id,
          lang: route.params.lang
        });
      }else{
        console.log("Error Syncing!", res)
      }
    }).catch((e)=>{
      console.log("Error Syncing!", e)
    });
    
  };

  return (
    <Layout
      navigation={navigation}
      onBack={() =>{navigation.navigate("IntroScreen");setSideBarConfig('introScreen')}}
      onNext={() => {}}
      nextEnabled={false}
      showMenu={false}
      title={header} 
      subTitle={subtitle} 
      backButton={false}
      homeButton={true}
    >
      <ScrollView style={styles.container}>
        <View>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>{title}</Text>
          </View>
          {data &&
            data.map((detail, index) => (
              <TouchableOpacity
                key={index}
                style={styles.item}
                onPress={() => handleNavigate(detail.title)}
              >
                <View style={styles.titleContainer}>
                  <View style={[
                    styles.statusBar, 
                    detail.status === "success" ? { backgroundColor: "#19736e" } : 
                    detail.status === "progress" ? { backgroundColor: "#e17d28" } : 
                    {}
                  ]}></View>
                  <Text style={styles.title}>{detail.title}</Text>
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
  infoIcon: {
    height: 20,
    position: "relative",
    top: "-7px",
  },
  headerContainer : {
    height : 70,
    justifyContent : 'center'
  },
  header: {
    fontSize: 22,
    fontFamily: "vestas-sans-semibold",
    marginLeft : 20
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
    marginLeft : 20,
    fontSize : 18,
    color : '#1f3144',
    width : "80%"
  },
  statusBar : { 
    width : 12, 
    height : 67
  },
  endStyle : {
    marginRight : 15
  }
});

export default FiveChapters;
