import React, { useState, useEffect, useContext } from "react";
import {
  Alert,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { launchCamera } from "react-native-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Base64Context } from "../App";
import { getCurrentTurbineInstance, setCurrentTurbineInstance } from "../util/asyncUtils";
import { LanguageContext } from "../Shared/languageContext";



function ImagePicker({ taskData ={}, from }) {
  const [task, setTask] = useState({}); 
  const {base64Data, updateBase64Data} = useContext(Base64Context);
  const { labels } = useContext(LanguageContext);

  const [pickedImage, setPickedImage] = useState(null);

  useEffect(() => {
    setTask(taskData);
    const loadImageUri = async () => {
      try {
        const turbineInstance = await getCurrentTurbineInstance();
        if (turbineInstance) {
          if (turbineInstance?.tasks && turbineInstance?.tasks?.length > 0) {
            const selectedTask = turbineInstance?.tasks.find(
              (t) => t?.taskId === taskData?.id 
            );
            if (selectedTask?.imageUri) {
              setPickedImage(selectedTask.imageUri);
            }
          }
        }
      } catch (error) {
        console.error("Error loading image from AsyncStorage", error);
      }
    };

    loadImageUri();
  }, [taskData, from, pickedImage]);

  async function verifyPermissions() {
    if (Platform.OS !== "android") {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: "Camera Permission",
        message: "This app needs camera access to take pictures.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert("Camera permission denied");
      return false;
    }

    return true;
  }

  const updateBase64 = async (imageData) => {
    try {
      const turbineInstance = await getCurrentTurbineInstance();
      if (turbineInstance) {
        const existingTaskIndex = turbineInstance?.tasks?.findIndex(
          (t) => t.taskId === task.id
        );
      

        if (existingTaskIndex !== -1) {
          turbineInstance.tasks[existingTaskIndex].imageUri = imageData.uri;
          
          let contextBase64 = base64Data?.find(i => i.taskId == task.id)

          if (base64Data.length === 0 && contextBase64 === undefined) {
            let imageObj = {
              base64Url: imageData.base64,
              imageUri: imageData.uri,
              turbineId: turbineInstance.turbineId,
              taskId: turbineInstance.tasks[existingTaskIndex].taskId,
              subTaskId: turbineInstance.tasks[existingTaskIndex].subTaskId,
            };
            console.log("if")

            await updateBase64Data([...base64Data, imageObj]);
          } else if (base64Data.length > 0 && contextBase64 === undefined) {
            let imageObj = {
              base64Url: imageData.base64,
              imageUri: imageData.uri,
              turbineId: turbineInstance.turbineId,
              taskId: turbineInstance.tasks[existingTaskIndex].taskId,
              subTaskId: turbineInstance.tasks[existingTaskIndex].subTaskId,
            };
            console.log("else if")

            await updateBase64Data([...base64Data, imageObj]);
          } else {

            let dataToUpdate = contextBase64 || {};
            dataToUpdate.imageUri = imageData.uri,
            dataToUpdate.turbineId= turbineInstance.turbineId,
            dataToUpdate.base64Url = imageData.base64;
            console.log("else")

            await updateBase64Data([...base64Data, dataToUpdate]);
          }

          console.log("Updated imageUri in turbineInstance.tasks:", turbineInstance);

          await setCurrentTurbineInstance(turbineInstance);
        } else {
          console.log("Task not found in turbineInstance.tasks");
        }
      } else {
        console.log("No tasks found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error updating imageUri:", error);
    }
  };

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    launchCamera(
      {
        saveToPhotos: true,
        mediaType: "photo",
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.5,
        includeBase64: true,
      },
      async (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage);
        } else {
          const uri = response?.assets[0].uri;
          setPickedImage(uri);
          await updateBase64(response?.assets[0]);
        }
      }
    );
  }

  const renderPlaceholder = () => (
    <>
      <Text style={styles.attachText}>{labels.ChapterComponents.imagepicker}</Text>
      <Image
        source={require("../assets/camera-icon.png")}
        style={styles.cameraIcon}
      />
    </>
  );

  const onClose = async () => {

    try {
      const turbineInstance = await getCurrentTurbineInstance();
      if (turbineInstance) {

        const taskIndex = turbineInstance?.tasks?.findIndex(
          (t) => t.taskId === task.id
        );

        if (taskIndex !== -1) {
          const base64DataIndex = base64Data.findIndex(i => i.taskId === task.id && turbineInstance.turbineId === i.turbineId);
        
          if (base64DataIndex !== -1) {
            const updatedBase64Data = [...base64Data];
            updatedBase64Data[base64DataIndex] = {
              ...updatedBase64Data[base64DataIndex],
              base64Url: null,
              imageUri: null
            };
        
            await updateBase64Data(updatedBase64Data);
        
            turbineInstance.tasks[taskIndex].imageUri = null;
        
            await setCurrentTurbineInstance(turbineInstance);
            setPickedImage(null);
          }
        }
        
      }
    } catch (error) {
      console.error( error);
    }
  };

  return (
    <View style={styles.imagecontainer}>
      <TouchableOpacity style={styles.attachmentBox} onPress={takeImageHandler}>
        {pickedImage ? (
          <View style={styles.imagePreview}>
            <Image style={styles.image} source={{ uri: pickedImage }} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text>
                <Icon name="close" size={18} style={styles.closeIcon} />
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderPlaceholder()
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagecontainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    marginVertical: 20,
  },
  attachmentBox: {
    width: "70%",
    height: 170,
    borderWidth: 1,
    borderColor: "lightgrey",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    position: "relative",
  },
  cameraIcon: {
    width: 50,
    height: 40,
  },
  attachText: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 16,
    color: "grey",
  },
  closeButton: {
    position: "absolute",
    top: -20,
    right: -20,
    backgroundColor: "#d3d7db",
    borderRadius: 20,
    padding: 10,
  },
});

export default ImagePicker;
