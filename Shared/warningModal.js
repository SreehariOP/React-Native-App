import React, {useState, useRef, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { LanguageContext } from "../Shared/languageContext";
 
const WarningModal = ({ isVisible, toggleModal, popup }) => {
    const [isWarningVisible, setWarningVisible] = useState(false);
    const [isButtonEnabled, setButtonEnabled] = useState(false);
    const [scrollViewHeight, setScrollViewHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const scrollViewRef = useRef();
    const { labels } = useContext(LanguageContext);
  if (!popup || popup.length === 0) return null;

  useEffect(() => {
    if (popup && popup.length > 0) {
      if (contentHeight <= scrollViewHeight) {
        setButtonEnabled(true);
      } else {
        setButtonEnabled(false); 
      }
    }
  }, [contentHeight, scrollViewHeight, popup]); ;

  const handleScroll = ({ nativeEvent }) => {
    const isAtBottom = nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >= nativeEvent.contentSize.height - 20;
    if (isAtBottom) {
      setButtonEnabled(true);
    }
  };
 
  return (
<Modal isVisible={isVisible} onBackdropPress={() => {}}>
    <View style={{ ...styles.modalContent, width: '95%', alignSelf: 'center' }}>
      <View style={styles.topContainer}>
        <Image
          style={styles.warningImage}
          source={require("../assets/warning-icon.png")}
          resizeMode="contain"
        />
      </View>
        {popup && popup.length > 0 && (
        <ScrollView 
          style={styles.scrollView} 
          onScroll={handleScroll} 
          onContentSizeChange={(width, height) => setContentHeight(height)}
          onLayout={({ nativeEvent }) => setScrollViewHeight(nativeEvent.layout.height)}
          scrollEventThrottle={16}
          ref={scrollViewRef}
        >
          {/* <Text style={styles.modalTitle}>{popup[0].title}</Text>
          {popup.list.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row' }}>
              <Text style={{ marginRight: 5, fontSize: 18 }}>•</Text>
              <Text style={{ fontSize: 18, fontFamily: 'vestas-sans-book', width: "80%", flex: 1, lineHeight: 22, marginBottom: 5 }}>{item.value}</Text>
            </View>
          ))} */}
          {popup.map((popupItem, popupIndex) => (
             <View key={popupIndex} style={styles.popupContainer}>
               <Text style={styles.modalTitle}>{popupItem.title}</Text>
               {popupItem.list.map((item, index) => (
                 <View key={index} style={{ flexDirection: 'row' }}>
                   <Text style={{ marginRight: 5, fontSize: 18 }}>•</Text>
                   <Text style={{ fontSize: 18, fontFamily: 'vestas-sans-book', width: "80%", flex: 1, lineHeight: 22, marginBottom: 5 }}>{item.value}</Text>
                 </View>
               ))}
             </View>
          ))}
       </ScrollView>
       )}
       <View style={styles.bottomContainer}>
       <TouchableOpacity onPress={toggleModal} style={[styles.acknowledgeButton, isButtonEnabled ? styles.buttonEnabled : styles.buttonDisabled]} disabled={!isButtonEnabled}>
          <Text style={styles.acknowledgeText}>{labels.ChapterComponents.acknowledge}</Text>
         </TouchableOpacity>
        </View>
    </View>
</Modal>
  );
};
 
const styles = StyleSheet.create({
modalContent: {
  backgroundColor: 'white',
  borderRadius: 10,
  justifyContent: 'space-between',
  marginBottom: 10,
  height: 450,
  overflow: 'hidden', 
},
topContainer: {
  backgroundColor: '#f0f0f0', 
  paddingVertical: 5,
  alignItems: 'center',
},
warningImage: {
  width: 60, 
  height: 60, 
},
popupContainer: {
  marginBottom: 20,  
},
modalTitle: {
  fontFamily: 'vestas-sans-semibold',
  fontSize: 18,
  marginVertical: 10,
  lineHeight: 22,
  textAlign: 'center', 
  paddingHorizontal: 20, 
},
scrollView: {
  paddingHorizontal: 15,
},
bottomContainer: {
  paddingVertical: 12, 
  borderColor: '#ccc', 
  backgroundColor: '#f0f0f0', 
},
acknowledgeButton: {
  paddingVertical: 10,
  paddingHorizontal: 30,
  borderRadius: 50,
  marginTop: 5,
  alignSelf: 'center',
},
buttonEnabled: {
  backgroundColor: "#4BA6F7",
},
buttonDisabled: {
  backgroundColor: "#b7dbfc",
},
acknowledgeText: {
  color: '#fff',
  textAlign: 'center',
  fontSize: 20,
  fontFamily: 'vestas-sans-book',
},
});
 
export default WarningModal;
