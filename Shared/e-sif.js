import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ESIF = () => {
  return (
    <View>
        <TouchableOpacity
            style={styles.closeButton}
            onPress={() => closeESIF()}
        >
            <Text>
                <Icon name="close" size={18} style={styles.closeIcon}/>
            </Text>
        </TouchableOpacity>
        <View style={{margin : -10 , justifyContent: 'center', alignItems: 'center'}}>
            <Image source={require('../assets/e-SIF.png')}/>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    closeButton: {
        position: "absolute",
        backgroundColor: "#d3d7db",
        alignItems : 'center',
        width : 30,
        borderRadius: 50,
        padding: 5,
        right : 15,
        top : 10,
        zIndex : 10,
    },
    closeIcon: {
        color: 'black'
    },
});

export default ESIF;
