import React , {useState,useEffect} from "react";
import { View, Text,Image ,StyleSheet,TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import Layout from '../Layout';
import {getTimeStamp,getTimeStampDone} from '../util/timeStamp';
import { getCurrentTurbineInstance } from "../util/asyncUtils";

const YawSystemOverview =({navigation, route}) => {
    const {data,from} = route.params;
    const handlePress = (item) => {
        navigation.navigate('FiveChapters', { details: item.task.filter(z=> !z?.hidden).map(a=> a.id+" " +a.value), title: item.id+" " +item.value });
    };
    const [timeStampStates, setTimeStampStates] = useState([]);

    useEffect(() => {
        const fetchTimeStamps = async () => {
          const turbineInstance = await getCurrentTurbineInstance();
          console.log(data.yawsystem.map(detail => renderTimeStampState([detail.id])))
          const states = await Promise.all(data.yawsystem.map(detail => renderTimeStampState([detail.id],turbineInstance)));
          setTimeStampStates(states);
        };
    
        fetchTimeStamps();
      }, [data.yawsystem,from]);

    const renderTimeStampState = async (id,turbineInstance) => {
        
        let stampState = await getTimeStampDone(id,turbineInstance);
        switch (stampState[id]) {
          case "completed":
            return <Image style={styles.infoIcon} source={require('../assets/success-icon.png')} />;
          case "inProgress":
            return <Image style={styles.infoIcon} source={require('../assets/progress-icon.png')} />;
          default:
            return null;
        }
      }

    return (
        <Layout style={styles.fullWidth} onBack={() => navigation.goBack()} onNext={() => {}} nextEnabled={false} showMenu={false}>
            <ScrollView contentContainerStyle={styles.container}>
            <ImageBackground
              source={require("../assets/Chapters_BG_2.png")}
              style={styles.imageBackground}
              resizeMode='cover'
            >
             <Text style={styles.header}>{data.header}</Text>
             <View style={{marginBottom: 50, paddingEnd:25,paddingStart:25}}> 

             {data.yawsystem.map((item, index) => (
                  <TouchableOpacity key={index} style={[styles.item, index === data.yawsystem.length - 1 && styles.noBorder]} onPress={() => handlePress(item)}>
                    <Text style={styles.title}>{item.id} {item.value}</Text>
                    <View style={styles.endStyle} >
                    <View style={{marginEnd:10, paddingEnd:5,paddingStart:5,alignSelf: 'center' }}>{timeStampStates[index]}</View>
                    <Image style={{marginEnd:5,marginEnd:5,alignSelf: 'center'}} source={require('../assets/arrow.png')} />
                    </View>
                    
                  </TouchableOpacity>
               ))}
                </View> 
             </ImageBackground>
            </ScrollView>
       </Layout>
   );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  endStyle:{
    flexDirection: 'row',
  },
    container:{
        flex: 1,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor: '#f8f8f8',
        width:'100%'
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center'
      },
    header:{
        fontSize: 24,
        fontFamily: 'vestas-sans-semibold',
        marginVertical: 20,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 9, 
        paddingHorizontal:10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems:'center',
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    title : {
        fontSize: 20,
        paddingRight: 10,
        color: '#3c3c3c',
        fontFamily: 'vestas-sans-medium'
    },
    icon: {
        color: '#000'
    }
});

export default YawSystemOverview;