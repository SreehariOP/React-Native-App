import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Animated, Modal, Image } from "react-native";
import Layout from "../Layout";
import { getAllTurbineInstance, makeAllTurbineInstanceFalse } from "../util/asyncUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContext } from '../Shared/NavigationContext';
import { useIsFocused } from "@react-navigation/native";
import { LanguageContext } from "../Shared/languageContext";
import Icon from 'react-native-vector-icons/MaterialIcons';


const ActivityScreen = ({navigation ,  route}) => {
    const { labels } = useContext(LanguageContext);

    const [inProgressTurbines, setInProgressTurbines] = useState([]);
    const [completedTurbines, setCompletedTurbines] = useState([]);
    const { canGoBack } = route?.params ?? false;

    const {sideBarConfig, setSideBarConfig } = useContext(NavigationContext)
    const isFocused = useIsFocused();

    const [modalVisible, setModalVisible] = useState(false);
    const {selectedLanguage, setLanguage} = useContext(LanguageContext);
    const [selectedLanguageLabel, setSelectedLanguageLabel] = useState('En');

    const { width, height } = useWindowDimensions();

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        })
        const loadInitials = async () => {
            let allTurbine = await getAllTurbineInstance();
            setInProgressTurbines(
                allTurbine.filter(t => t.overallPercentage >= 0 && t.overallPercentage < 100)
              );
              
              setCompletedTurbines(
                allTurbine.filter(t => t.overallPercentage === 100)
              );
           
        };
        if (isFocused) {
            loadInitials();
            setSideBarConfig('activity');
        }

    }, [isFocused, navigation]);

    navigateToInstanse = async (turbine, i, isEsif = false) => {
        const storedInstance = await AsyncStorage.getItem('my-key');
        let updateInstance = storedInstance ? JSON.parse(storedInstance) : [];

            try {
                updateInstance = updateInstance.map((inst, index) => ({
                    ...inst,
                    isCurrentTurbine: turbine.turbineId === inst.turbineId && turbine.serviceOrder === inst.serviceOrder  ? true : false
                }));
                await AsyncStorage.setItem('my-key', JSON.stringify(updateInstance));
                if(isEsif == true){
                    navigation.navigate('EsifScreen', { activityEsif: true});
                }else{
                    navigation.navigate("LoginScreen", { initialStep: 3 });
                }
                
    
            } catch (error) {
                console.error('Error updating instance and navigating:', error);
            }
        // }
    }
    const handleLanguageChange = (item) => {
        setLanguage(item.value);
        setSelectedLanguageLabel(item.label.split(' ')[0]);
        setModalVisible(false); 
    };

    const navEnterDetails = async () => {
        const success = await makeAllTurbineInstanceFalse();
    
        if (success) {
          
            navigation.navigate("LoginScreen", { initialStep: 2 });
        } else {
            console.error("Failed to update turbine instances, navigation aborted.");
        }
    };
 
    const languageOptions = [
        { label: 'En (English)', value: 'en', flag: require("../assets/Flag_EN001.png") },
        { label: 'Es (Español)', value: 'es', flag: require("../assets/Flags_ES001.png") },
        { label: 'Pt (Português)', value: 'pt', flag: require("../assets/Flag_PT001.png") },
    ];
    const renderDummyInProgressCard = () => {
        return (
            <View style={[styles.item, styles.dummyInProgressCard]}>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.dummyCellLeft]}>
                            <Text style={styles.cardText}>{labels.ActivityScreen.turbineid}{`\n* * * * * *`}</Text>
                        </View>
                        <View style={[styles.cell, styles.dummyCellRight]}>
                            <Text style={styles.cardText}>{labels.ActivityScreen.serviceOrder}{`\n* * * * * *`}</Text>
                        </View>
                    </View>
                    <View style={styles.separatorContainer}>
                        <View style={styles.dummyleftSeparator} />
                        <View style={styles.dummyrightSeparator} />
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.cell, styles.dummyCellLeft]}>
                            <Text style={styles.cardText}>{labels.ActivityScreen.serviceType}{`\n* * * * * *`}</Text>
                        </View>
                        <View style={[styles.cell, styles.dummyCellRight]}>
                            <Text style={styles.esifCardText}>{labels.footer.esif}</Text>
                        </View>
                    </View>
                    <View style={styles.dummyConcentricCircle}>
                        <View style={styles.dummyProgressCircle}>
                            <Text style={styles.dummyProgressText}>0%</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
      };
       
      const renderDummyCompletedCard = () => {
        return (
            <View style={[styles.item, styles.dummyCompletedCard]}>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.dummyTurbineId}>
                            <Text style={styles.completedCardText}>{labels.ActivityScreen.turbineid}{`\n* * * * * *`}</Text>
                        </View>
                        <View style={styles.dummyServiceOrder}>
                            <Text style={styles.completedCardText}>{labels.ActivityScreen.serviceOrder}{`\n* * * * * *`}</Text>
                        </View>
                        <View style={styles.dummyEsif}>
                            <Text style={styles.completedCardText}>{labels.footer.esif}</Text>
                        </View>
                    </View>
                    
                </View>
            </View>
        );
      };

    return (
        <Layout
            navigation={navigation}
            title={labels.ActivityScreen.activity}
            nextEnabled={true}
            onNew={() => navEnterDetails()}
            newEnabled={true}
            backButton={false}
            homeButton={false}
            backEnabled={false}
            isUserHeader={true}
            isFooterShow={false}
            showLanguageDropdown={true}
            onLanguagePress={() => {setModalVisible(true)}}
            selectedLanguageLabel={selectedLanguageLabel}
        >
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalContainer}
                    onPressOut={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeaderContainer}>
                            <Text style={styles.modalHeader}>{labels.ActivityScreen.language}</Text>
                            <Icon name="close" size={24} color="gray" onPress={() => setModalVisible(false)} />
                        </View>
                        <ScrollView style={styles.modalItemsContainer}>
                            {languageOptions.map((item) => (
                                <TouchableOpacity key={item.value} onPress={() => handleLanguageChange(item)} style={[                                     
                                    styles.modalItem,                                     
                                    selectedLanguage === item.value ? styles.selectedItem : {}                                 
                                    ]}
                                >
                                    <Image source={item.flag} style={styles.dropdownFlag} />
                                    <Text style={styles.modalItemText}>{item.label}</Text>
                                    {/* {selectedLanguage === item.value && (                                         
                                        <Icon name="check" size={20} color="lightgrey" style={styles.checkIcon} /> 
                                    )} */}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
            <View style={styles.container}>
                <View style={styles.sectionContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>{labels.ActivityScreen.inProgress}</Text>
                        <View style={[inProgressTurbines.length === 0 ? styles.dummyCounter : styles.counter]}>
                            <Text style={styles.counterText}>{inProgressTurbines.length}</Text>
                        </View>
                    </View>
                    {inProgressTurbines.length === 0 ? (
                        renderDummyInProgressCard()
                    ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                        {inProgressTurbines.map((turbine, index) => (
                            <TouchableOpacity key={index}
                                style={[styles.item, styles.inProgressCards]}
                                onPress={() => navigateToInstanse(turbine, index)}
                                activeOpacity={1}
                            >
                                <View style={styles.card}>
                                    <View style={styles.row}>
                                        <View style={[styles.cell, styles.cellLeft]}>
                                            <Text style={styles.cardText}>{labels.ActivityScreen.turbineid}</Text>
                                            <Text style={styles.cardText}>{turbine.turbineId}</Text>
                                        </View>
                                        <View style={[styles.cell, styles.cellRight]}>
                                            <Text style={styles.serviceOrderText}>{labels.ActivityScreen.serviceOrder}</Text>
                                            <Text style={styles.cardText}>{turbine.serviceOrder || 0}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.separatorContainer}>
                                        <View style={styles.leftSeparator} />
                                        <View style={styles.rightSeparator} />
                                    </View>
                                    <View style={styles.row}>
                                        <View style={[styles.cell, styles.cellLeft]}>
                                            <Text style={styles.cardText}>{labels.ActivityScreen.serviceType}{`\n`}{labels.ActivityScreen.fouryearly}</Text>
                                            {/* <Text style={styles.cardText}>4-Yearly</Text> */}
                                        </View>
                                        <View style={[styles.cell, styles.cellBottomRight]}>
                                            <Text style={styles.esifCardText}>{labels.footer.esif} </Text>
                                        </View>
                                    </View>
                                    <View style={styles.concentricCircle}>
                                        <View style={styles.progressCircle}>
                                            <Text style={styles.progressText}>{`${turbine.overallPercentage || 0}%`}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    )}
                </View>
                <View style={styles.completedSectionContainer}>
                    <View style={[styles.sectionContainer, { flex: 1 }]}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.header}>{labels.ActivityScreen.completed}</Text>
                            <View style={[inProgressTurbines.length === 0 ? styles.dummyCounter : [styles.counter, styles.completedCounter]]}>
                                <Text style={styles.counterText}>{completedTurbines.length}</Text>
                            </View>
                        </View>
                        {inProgressTurbines.length === 0 && completedTurbines.length === 0 ? (
                            renderDummyCompletedCard()
                        ) : (
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.verticalList}>
                            {completedTurbines.map((turbine, index) => (
                                <View key={index}>
                                    <TouchableOpacity key={index} onPress={() => navigateToInstanse(turbine, index, true)} style={styles.inProgressCards} activeOpacity={1}>
                                        <View style={styles.completedCard}>
                                            <View style={[styles.turbineId, styles.overlap]}>
                                                <Text style={styles.completedCardText}> {labels.ActivityScreen.turbineid}{`\n${turbine.turbineId}`}</Text>
                                            </View>
                                            <View style={[styles.serviceOrder, styles.overlap]}>
                                                <Text style={styles.completedCardText}>{labels.ActivityScreen.serviceOrder}{`\n${turbine.serviceOrder}`}</Text>
                                            </View>
                                            <View style={styles.esif}>
                                                <Text style={styles.completedCardText}>{labels.footer.esif}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    {index < completedTurbines.length - 1 && (
                                        <View style={styles.cardSeparator}></View>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                        )}
                    </View>
                </View>
            </View>
        </Layout>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    completedSectionContainer: {
        backgroundColor: '#e3e5e8', 
        // padding: 10, 
        flex: 1, 
    },
    sectionContainer: {
        marginTop: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: 10,
    },
    header: {
        fontSize: 22,
        fontFamily: 'vestas-sans-semibold',
        marginBottom: 10,
    },

    counter: {
        backgroundColor: '#E17D28',
        borderRadius: 15,
        width: 45,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 5
    },
    dummyCounter: {
        backgroundColor: '#606d7b',
        borderRadius: 15,
        width: 45,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        marginBottom: 5
    },
    completedCounter: {
        backgroundColor: '#19736E',
    },
    counterText: {
        color: '#fff',
        fontFamily: 'vestas-sans-semibold',
    },
    horizontalList: {
        paddingLeft: 20,
    },
    verticalList: {
        flex: 1,
        paddingHorizontal: 25,
    },
    item: {
        marginRight: 15,
        backgroundColor: '#f8dfc9',
        borderRadius: 20,
        minWidth: 230,
        minHeight: 150,
        marginBottom: 20,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: '#E17D28',
    },
    card: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    cell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        
    },
    cellLeft: {
        width: '45%',
        borderRightWidth: 2,
        borderRightColor: '#fff',
        backgroundColor: '#fff',
        zIndex: 2, 
        marginRight: -20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        paddingRight: 20,
        justifyContent: 'center', 
        alignItems: 'center', 
        
    },
    cellRight: {
        width: '45%',
        backgroundColor: '#f8dfc9',
        paddingLeft: 35,
    },
    cellBottomRight: {
        backgroundColor: '#f8dfc9',
        paddingLeft: 40,
        marginRight: 22
    },
    separatorContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 1,
    },
    leftSeparator: {
        flex: 1,
        backgroundColor: '#F8DFC9',
    },
    rightSeparator: {
        flex: 1,
        backgroundColor: '#E17D28',
    },
    concentricCircle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 52,
        height: 52,
        borderRadius: 30,
        backgroundColor: '#fff',
        borderColor: '#E17D28',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateX: -20 }, { translateY: -27.5 }],
        zIndex: 2,
    },
    progressCircle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 35,
        height: 35,
        borderRadius: 30,
        backgroundColor: '#E17D28',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateX: -17 }, { translateY: -18 }],
        zIndex: 3
    },
    progressText: {
        fontFamily: 'vestas-sans-semibold',
        fontWeight: 'bold',
        fontSize: 12,
        color: '#fff'
    },
    cardText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'vestas-sans-book',
        lineHeight: 22,
        marginRight: 15,
        paddingLeft: 20,
        flexWrap: 'nowrap', 
        justifyContent: 'center',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        width: '100%',
    },
    serviceOrderText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'vestas-sans-book',
        lineHeight: 22,
     
    },
    esifCardText: {
        fontSize: 14,
        fontFamily: 'vestas-sans-book',
        lineHeight: 22,
        paddingLeft: 25,
        marginRight: 15
    },
    title: {
        fontSize: 18,
        fontFamily: 'vestas-sans-book',
        alignSelf: 'center',
    },
    completedCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#CCC',
        borderRadius: 20,
        overflow: 'hidden',
        minHeight: 80,
        maxWidth: 320,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: '#539692',
        alignSelf: 'center',
        width: '95%'
    },
    cardSeparator: {
        height: 2,
        backgroundColor: '#ddd',
        width: '90%',
        alignSelf: 'center',
        marginVertical: 15
    },
    completedCardText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'vestas-sans-book',
        lineHeight: 22,
        flexWrap: 'wrap'
    },
    turbineId: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        zIndex: 3,
        marginRight: -15
    },
    serviceOrder: {
        flex: 1.5,
        backgroundColor: '#C6DCDB',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        zIndex: 2,
        marginRight: -20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    esif: {
        flex: 1,
        backgroundColor: '#8CB9B7',
        marginRight: -20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    overlap: {
        position: 'relative',
        elevation: 3
    },
    dummyCard: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 125,
        marginBottom: 20,
    },
    dummyInProgressCard: {
        backgroundColor: '#a2a9b1',
        borderColor: '#606d7b',
        alignSelf: 'center',
        minWidth: 265,
        minHeight: 130, 
        borderRadius: 22,
    },
    dummyCompletedCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#CCC',
        borderRadius: 22,
        overflow: 'hidden',
        minHeight: 70,
        maxWidth: 280,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: '#606d7b',
        alignSelf: 'center',
        width: '90%'
    },
    dummyCellLeft: {
        width: '45%',
        borderRightWidth: 2,
        borderRightColor: '#fff',
        backgroundColor: '#fff',
        zIndex: 2, 
        marginRight: -20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        paddingRight: 10,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    dummyCellRight: {
      backgroundColor: '#d3d7db',
      paddingLeft: 10,
      width: '60%',
    },
    dummyleftSeparator: {
      flex: 1,
      backgroundColor: '#f0f0f0',
    },
    dummyrightSeparator: {
      flex: 1,
      backgroundColor: '#606d7b',
    },
    dummyConcentricCircle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 52,
        height: 52,
        borderRadius: 30,
        backgroundColor: '#fff',
        borderColor: 'grey',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateX: -15 }, { translateY: -25 }],
        zIndex: 2,
        backgroundColor: '#a2a9b1'
    },
    dummyProgressCircle: {
      width: 35,
      height: 35,
      borderRadius: 30,
      backgroundColor: '#606d7b',
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ translateX: 0 }, { translateY: 0 }],
      zIndex: 3,
    },
    dummyProgressText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#fff',
      fontFamily: 'vestas-sans-semibold',
    },
    dummyTurbineId: {
      flex: 1,
      backgroundColor: '#fff', 
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      zIndex: 3,
      marginRight: -10,
    },
    dummyServiceOrder: {
        flex: 1.5,
        backgroundColor: '#d3d7db',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        zIndex: 2,
        marginRight: -10,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    dummyEsif: {
        flex: 1,
        backgroundColor: '#606d7b', 
        marginRight: -10,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    modalContainer: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        width: '80%',
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeaderContainer: {
        flexDirection: 'row',
        padding:10,
        backgroundColor: 'white', 
        borderTopLeftRadius: 8, 
        borderTopRightRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height : 1},
        shadowOpacity : 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        fontSize: 18,
        fontFamily: 'vestas-sans-semibold',
        textAlign: 'center',
        paddingVertical: 10, 
        flex: 1,
    },
    modalItemsContainer: {
        padding: 20, 
    },
    closeButtonContainer: {
        position: 'absolute',
        right: 10,
        top: 10,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    selectedItem: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalItemText: { 
        marginLeft: 10,
        fontSize: 16,
        fontFamily: 'vestas-sans-book',
    },
    checkIcon: {
        marginLeft: 'auto'
    },
    dropdownFlag: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
});
export default ActivityScreen;