import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, Platform, Image, TouchableOpacity ,Linking  } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

// Componenets
import Layout from '../Layout';

// Datas or Values
import { LanguageContext } from "../Shared/languageContext";
import { getCurrentTurbineInstance } from '../util/asyncUtils';
import { NavigationContext } from '../Shared/NavigationContext';
import { dataSet } from '../assets/config/sourceConfig';
import updateTaskAsyncStorage from '../util/task-async-storage';

const EsifScreen = ({ navigation , route }) => {
  const { labels, systemContent, selectedLanguage } = useContext(LanguageContext);
  const {sideBarConfig, setSideBarConfig } = useContext(NavigationContext)
  const isFocused = useIsFocused();
  const [isActivity, setIsActivity] = useState(route?.params?.activityEsif || false)
  const [data, setData] = useState([]);

  useEffect(() => {
    //setSideBarConfig('sif');
    const fetchTimeStamps = async () => {
      try {
        let eSIFArray = [];
        let finalArr = []
        if(isActivity){
         
          finalArr = [...dataSet[0][selectedLanguage].content.content,...dataSet[1][selectedLanguage].content.content]
        }else{
          finalArr =systemContent.content
        }
        finalArr.map((one) => {
          eSIFArray.push({
            "id": one.id,
            "label": one.value,
            "isStatus": false,
            "chapter": true,
            "esifHeader" : one.esifHeader || '',
            "esifHeaderAbove" : one.esifHeaderAbove || false,
          });
          one.task.map((task) =>{
            if(task.isShowESIF == true){
             
              eSIFArray.push({
                "id": task.id,
                "label": task.value,
                "isStatus": task.isStatusShowESIF,
                "yearly": task?.yearly,
                "fourYearly": task?.fourYearly,
                "task": true
              });
            }
           
            if(task.isSubTaskShowESIF == true){
              task.subtask.map((subtask) =>{
                if(subtask.sifShow){
                  eSIFArray.push({
                    "id": ["5.4.2" ,"5.1.5" ,"5.1.8" ,"5.2.2" ,'5.2.1',"5.3.1","5.3.2","5.3.3"].includes(task.id) ? null : subtask.id,
                    "pid": task.id,
                    "label": subtask.sifShow ? subtask.sifHeader : subtask.value,
                    "yearly": subtask?.yearly,
                    "fourYearly": subtask?.fourYearly,
                    "isStatus": subtask.isStatusShowESIF ? true : false,
                    "subtask": true
                  });
                  if(subtask.list){
                    subtask.list.map((esifList)=>{
                      if(esifList.sifShow){
                        eSIFArray.push({
                          "id":  esifList.id,
                          "pid": task.id,
                          "label": esifList.sifShow ? esifList.sifHeader : esifList.value,
                          "yearly": esifList?.yearly,
                          "fourYearly": esifList?.fourYearly,
                          "isStatus": esifList.isStatusShowESIF ? true : false,
                          "subtask": true
                        });
                      }
                      
                    })
                  }
                }  
                
              })
            }
          })
        });          

        // Get local storage
        const turbineInstance = await getCurrentTurbineInstance();
        // Check the status from local storage
        const states = eSIFArray.map((task) => {
            let localTask;
            if (task.isStatus) {
              if (task.subtask) {
                  if (["5.3.4.1", "5.3.4.3", "5.3.4"].includes(task.pid)) {
                      task.id = ["5.3.4.1", "5.3.4.3"].includes(task.pid) ? null : task.id;
                      task.pid = ["5.3.4.1", "5.3.4.3"].includes(task.pid) ? "5.3.4" : task.pid;
                  }
          
                  localTask = turbineInstance?.tasks?.find(t => t.subTaskId === task.id && t.taskId === task.pid);
          
              } else {

                  const adjustedTaskId = ["5.3.4.2"].includes(task.id) ? "5.3.4" : task.id;
                  localTask = turbineInstance?.tasks?.find(t => t.taskId === adjustedTaskId);
              }
          }

            if (localTask) {
              task['status'] = localTask.isResume ? "progress" : "success";
              task['moduleId'] = localTask.moduleId;
            }
            return task;
        });
        // console.log(states)
        setData(states);

      } catch (error) {
        console.error('Error fetching timestamps:', error);
      }
    };
    fetchTimeStamps();
  }, [ isFocused ]);

  const handleNavigate = (detail) => {
 
    const taskID = detail.pid ? detail.pid: detail.id;
    const yawSystemDetail = systemContent.content.find(
      (y) => y.id === taskID?.substring(0, 3)
    );
    console.log(yawSystemDetail)
    const taskDetail = yawSystemDetail.task.find((t) => t.id === taskID);
    const sectionTitle = yawSystemDetail.id + " " + yawSystemDetail.value;

    let task = {
      isResume: true,
      currentTaskId: taskDetail.id,
      currentSubTaskId: ["5.4.2" ,"5.1.5" ,"5.1.8" ,"5.2.2" ,'5.2.1',"5.3.1","5.3.2","5.3.3","5.3.4"].includes(taskDetail.id) ?   null
      : taskDetail.subtask[0].id,
      startTime: Date.now(),
    };

    console.log(
      task
    )
    updateTaskAsyncStorage("my-key", task).then(async(res)=>{
      if(res){
        navigation.navigate("TaskComponent", {
          task: taskDetail,
          sectionTitle: sectionTitle
        });
      }
    }).catch((e)=>{
      console.log("Error Syncing!", e)
    });
    
  };
  const renderHeader = (esifHeader) => (
    <View style={styles.header}>
      <Text style={[styles.cell, styles.cell1, styles.headerText]}>{labels.EsifScreen.headercell1}</Text>
      <Text style={[styles.cell, styles.cell2, styles.headerText]}>{esifHeader}</Text>
      <Text style={[styles.cell, styles.cell3, styles.headerText]}>{labels.EsifScreen.headercell3}</Text>
      <Text style={[styles.cell, styles.cell4, styles.headerText]}>{labels.EsifScreen.headercell4}</Text>
    </View>
  );

  const renderItem = ({ item }) => {

    if (item.chapter) {
      return (
        <View>
        {item.esifHeaderAbove ? renderHeader(item.esifHeader) : null}
        
        <View style={styles.row}>
          <Text style={styles.chapterRow}>{`${item.id} ${item.label}`}</Text>
        </View>
        </View>
       
      )
    } else {
      return(
        
        <View style={styles.row} >
          <View style={[styles.cell, styles.cell1, styles.alignCenter]}>
          {/* <TouchableOpacity onPressOut={() => item?.status == "success" ? null  : handleNavigate(item)}> */}
          {!item.subtask && (<Text>{item.id}</Text>)}
          {/* </TouchableOpacity> */}
          </View>
          <View style={[styles.cell, styles.cell2]}>
          <Text>{item.label}</Text>
          </View>
          <View style={[styles.cell, styles.cell3, styles.alignCenter]}>
            <View style={[item?.yearly ==true ?  {display:'block'} : {display:'none'}]}>
            { item.status == "progress" && (<Image source={require("../assets/progress-icon.png")}/> )}
            { item.status == "success" && (<Image source={require("../assets/success-icon.png")}/> )}
            </View>
           
          </View>
          <View style={[styles.cell, styles.cell4, styles.alignCenter]}>
            <View style={[item?.fourYearly ==true  ?  {display:'block'} : {display:'none'}]}>
            { item.status == "progress" && (<Image source={require("../assets/progress-icon.png")}/> )}
            { item.status == "success" && (<Image source={require("../assets/success-icon.png")}/> )}
            </View>
          </View>
        </View>
      )
    }
  };

  return (
    <Layout
      navigation={navigation}
      backButton={true}
      homeButton={false}
      title={"e-SIF"}
      isFooterShow={false}
    >
      <View style={styles.container}>
        <ScrollView >
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false} 
            style={{ marginBottom : 20 }}
          />
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 24 : 0, 
    marginHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#223144',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
  },
  row: {
    flexDirection: 'row',
    backgroundColor : "#ffffff"
  },
  cell: {
    padding: 8.5,
    borderBottomWidth: 0.5,
  },
  cell1: {
    width: '15%',
    borderLeftWidth: 0.5
  },
  cell2: {
    width: '55%',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
  },
  cell3: {
    width: '15%',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
  },
  cell4: {
    width: '15%',
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5
  },
  headerText: {
    color : "#ffffff",
    textAlign : 'center'
  },
  chapterRow : {
    backgroundColor : "#d0d4d8",
    padding : 8.5,
    width : "100%",
    textAlign : "center",
    borderWidth: 0.5
  },
  alignCenter : { 
    display : 'flex', 
    justifyContent : 'center', 
    alignItems : "center"
  }
});

export default EsifScreen;
