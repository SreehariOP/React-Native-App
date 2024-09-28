import React, { useState ,useRef,  useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Pdf from "react-native-pdf";
import { NavigationContext } from "../Shared/NavigationContext";
import { LanguageContext } from "../Shared/languageContext";
import { dataSet } from "../assets/config/sourceConfig";
 
// Componenets
import Layout from "../Layout";
 

const HomeScreen = ({ navigation, route }) => {
  const { lastScreen, sideBarConfig, fromSidebar, setFromSidebar, setSideBarConfig} = useContext(NavigationContext);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const pdfRef = useRef();
  const [scale, setScale] = useState(1);
  const { labels, abbreviation, setSystemContent, setAbbreviation, selectedLanguage, currentSystem, setCurrentSystem } = useContext(LanguageContext);

  const pdfMapping = dataSet[currentSystem?.id][selectedLanguage]['pdfMapping']['android'];
  const pdfMapping_ios = dataSet[currentSystem?.id][selectedLanguage]['pdfMapping']['ios'];

  useEffect(()=>{
    if(sideBarConfig !== 'homeScreen')
    setSideBarConfig('homeScreen');
  },[])

  const openPDF = (documentName) => {  
    console.log(documentName, Platform.OS);
    if (pdfMapping_ios[documentName]) {
      if (Platform.OS === 'ios') {
        let pdf = pdfMapping_ios[documentName];
        console.log('pdf', pdf);
        setSelectedPdf(pdf);
      } else if (Platform.OS === 'android') {
        let urlString = {uri : `bundle-assets://pdf/${pdfMapping[documentName]}`}
        setSelectedPdf(urlString);
      }
    } else {
      console.error("Document not found:", documentName);
    }
  };

  const zoomIn = () => {
    const newScale = scale + 0.5;
    setScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.5, 1);
    setScale(newScale);
  };


  const handleBackPress = () => {
    console.log(lastScreen, 'lastScreen');
    if (lastScreen?.name && fromSidebar) {
        navigation.navigate(lastScreen.name, { ...lastScreen.params});
        setFromSidebar(false); 
    }
  };

  if (selectedPdf) {
    return (
      <View style={styles.pdfContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setSelectedPdf(null)}
        >
          <Text>
            <Icon name="close" size={18} style={styles.closeIcon} />
          </Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ flex: 1 }}>
        <Pdf
          ref={pdfRef}
          source={selectedPdf}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
          scale={scale}
         
        />
        </ScrollView>
        {/* <View style={styles.zoomControls}>
          <TouchableOpacity onPress={zoomIn}>
            <Icon name="plus" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={zoomOut}>
            <Icon name="minus" size={30} color="black" />
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }
 
  return (
    <Layout
      navigation={navigation}
      onBack={() => navigation.navigate("LoginScreen", {initialStep: 3  })}
      onNext={() => {navigation.navigate("IntroScreen", {system: currentSystem, lang: selectedLanguage} )}}
      backEnabled={false}
      backButton={true}
      homeButton={false}
      title={dataSet[currentSystem?.id][selectedLanguage]["abbrevation"]["HeaderTitle"]} 
      subTitle={dataSet[currentSystem?.id][selectedLanguage]["abbrevation"]["subtitle"]} 
      backScreen={"LoginScreen"}
      backScreenParams= {{initialStep: 3}}
      isFooterShow = {!fromSidebar}
      handleBackPress={handleBackPress}
      fromSidebar={fromSidebar}
    >
      <ScrollView>
        {abbreviation.sections &&
          abbreviation.sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.container}>
              <View style={styles.sectionContainer}>
                  {section.title && (
                    <Text style={styles.title}>{`${section.index} ${section.title}`}</Text>
                  )}
                  {section.subTitle && (
                    <Text style={styles.subTitle}>{section.subTitle}</Text>
                  )}
                  {section.tables &&
                    section.tables.map((table, tableIndex) => (
                      <View key={tableIndex}>
                        <Text style={styles.tableName}>{table.tableName}</Text>
                        <View style={styles.table}>
                          <View style={styles.tableHeading}>
                            <Text
                              style={[
                                styles.tableHeadingText,
                                styles.borderRight,
                              ]}
                            >
                              {table.headings.lefth}
                            </Text>
                            <View style={styles.verticalLine} />
                            <Text style={styles.tableHeadingText}>
                              {table.headings.righth}
                            </Text>
                          </View>
 
                          {table.content &&
                            table.content.map((item, itemIndex) => {                                                  
                              const isLink = pdfMapping[item.left] || pdfMapping_ios[item.left];                           
                              return (
                                <TouchableOpacity                             
                                    key={itemIndex}                             
                                    style={styles.row}                             
                                    onPress={() => openPDF(item.left)}
                                >
                                <Text
                                  style={[                                 
                                    styles.cellText,                                   
                                    styles.borderRight,                                   
                                    isLink ? styles.linkText : null,                                 
                                  ]}
                                >
                                  {item.left}
                                </Text>
                                <View style={styles.verticalLine} />
                                <Text style={styles.cellText}>                                 
                                        {item.right}
                                </Text>
                                </TouchableOpacity>
                              );                           
                            })}
                        </View>
                      </View>
                    ))}
                </View>
            </View>
          ))}
          <View style={styles.infoContainer}>
            {abbreviation.info && (
              <View style={styles.info}>
                <Image
                  source={require("../assets/info-icon.png")}
                  resizeMode="contain"
                  style={styles.imageStyle}
                />
                <Text style={styles.infoText}>{abbreviation.info.text}</Text>
              </View>
            )}
            {abbreviation.page02 &&
              abbreviation.page02.map((item, index) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.title}>{`${item.index} ${item.title}`}</Text>
                  <Text style={styles.description}>{item.desc}</Text>
                </View>
            ))}
          </View>
      </ScrollView>
    </Layout>
  );
};
 
const styles = StyleSheet.create({
  container: {
    marginRight : 10,
    marginLeft : 10,
    marginTop : 15
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 5,
    color: "#434547",
  },
  subTitle : {
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 5,
    color: "#434547",
  },
  tableName: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 10,
    color: "#434547",
  },
  table: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e3e6e9",
  },
  tableHeading: {
    flexDirection: "row",
    backgroundColor: "#d3d7db",
    borderBottomWidth: 1,
    borderColor: "#e3e6e9",
    height: 35,
  },
  tableHeadingText: {
    flex: 1,
    color: "#595c5e",
    textAlign: "center",
    padding: 5,
    fontSize: 18,
    fontWeight: "700",
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: "#e3e6e9",
  },
  firstRow: {
    borderTopWidth: 1,
    borderColor: "#e3e6e9",
  },
  row: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e3e6e9",
  },
  cellText: {
    flex: 1,
    fontSize: 16,
    textAlign: "left",
    padding: 10,
    paddingVertical: 10,
    fontFamily: "vestas-sans-book",
    backgroundColor: "#f8f8f8",
  },
  linkText: {
    color: "#295dc4",
    textDecorationLine: "underline",
  },
  pdfContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 25,
  },
  pdfViewer: {
    flex: 1,
    marginTop: 20,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  closeButton: {
    position: "absolute",
    top: -20,
    zIndex: 100,
    right: 5,
    backgroundColor: "#d3d7db",
    borderRadius: 20,
    padding: 5,
  },
  infoContainer : {
    backgroundColor : "#ffffff",
    marginRight : 10,
    marginLeft : 10,
    marginBottom : 15
  },
  info: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 15
  },
  imageStyle: {
    width: 40,
    height: 40,
    marginRight: 10,
    alignSelf: "flex-start",
  },
  iconStyle: {
    marginRight: 8,
    fontSize: 40,
  },
  infoText: {
    flex: 1,
    paddingLeft: 5,
    fontSize: 16,
    textAlign: "left",
    alignSelf: "center",
    fontFamily: "vestas-sans-book",
    lineHeight: 22
  },
  section: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 6,
  },
  description: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "vestas-sans-book",
    lineHeight: 22
  },
  zoomControls: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
});
 
export default HomeScreen;