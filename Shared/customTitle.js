import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
 
const CustomTitle = ({ sectionTitle, sectionSubTitle, orientation }) => {
  const navigation = useNavigation();
  const handleMenuPress = () => {
    navigation.openDrawer();
  };
  return (
    <View style={[
      styles.headerContainer,
      orientation == "landscape" ? { paddingLeft: 15, marginTop: 0, marginBottom: -10, paddingRight: 15 } : { paddingTop: 10, paddingLeft :10 ,paddingRight : 0 }
    ]}>
      <View style={orientation == "landscape" ? { flexDirection: 'row' } : { flexDirection: 'coloumn', width: "85%" }}>
        <Text style={styles.headerText}>{sectionTitle}</Text>
        <Text style={[
          styles.subHeading,
          orientation == "landscape" ? { marginLeft: 10 } : {},
          orientation == "portrait" ? { marginVertical:10  } : {},
        ]}>
          {sectionSubTitle}
        </Text>
      </View>
      {orientation == "landscape" ? 
      <TouchableOpacity onPress={handleMenuPress} style={styles.menuIconContainer}>
        <Icon name="menu" size={20} style={styles.menuIcon} />
      </TouchableOpacity> : null}

    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 22,
    fontFamily: 'vestas-sans-semibold',
    alignItems: 'center',
  },
  menuIconContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    marginTop: 0,
    marginLeft: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuIcon: {
    color: 'black',
  },
  subHeading: {
    fontSize: 18,
    fontFamily: 'vestas-sans-book',
    lineHeight: 20
  },
});
export default CustomTitle;