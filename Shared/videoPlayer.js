import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Example of VTT parsing
const parseVTT = (vttText) => {
  // Basic VTT parser - you can improve this to handle more cases
  const cues = vttText?.split('\n\n').map(cue => {
    const [header, ...body] = cue.split('\n');
    const [startTime, endTime] = header.split(' --> ');
    return { startTime, endTime, text: body.join('\n') };
  });
  return cues;
};

const VideoPlayer = forwardRef(({ source, onTimeUpdate, isFocused }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scale = useSharedValue(1);
  const [videoWidth, setVideoWidth] = useState(width);
  const [videoHeight, setVideoHeight] = useState(height);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const orientationChangeHandler = async () => {
      const orientation = await ScreenOrientation.getOrientationAsync();
      setIsFullScreen(
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
    };

    const subscription = ScreenOrientation.addOrientationChangeListener(orientationChangeHandler);

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  useEffect(() => {
    setVideoWidth(width < height ? width : width / 2);
    setVideoHeight(width < height ? 250 : 350);
  }, [width, height]);

  useEffect(() => {
    if (isFocused) {
      if (isPlaying) {
        video.current?.playAsync();
      }
    } else {
      video.current?.pauseAsync();
    }
  }, [isFocused, isPlaying]);

  useEffect(() => {
    video.current.stopAsync().then(() => {
      video.current.setPositionAsync(0);
      setIsPlaying(false);
    });
    setIsPlaying(false);
    video.current?.pauseAsync();
  }, [source]);

  const handlePlayPause = () => {
    setIsPlaying(prevState => !prevState);
    if (isPlaying) {
      video.current?.pauseAsync();
    } else {
      video.current?.playAsync();
    }
  };

  useEffect(() => {
    let timeout;
    if (showControls) {
      timeout = setInterval(() => {
        setShowControls(true);
      }, 100);
    }
  }, [showControls]);

  useEffect(() => {
    video.current.stopAsync().then(() => {
      video.current.setPositionAsync(0);
      setIsPlaying(false);
    });
    setTimeout(() => {
      setShowControls(true);
    }, 1000);
  }, [source]);

  const handleFullScreen = async () => {
    if (isFullScreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    }
    setIsFullScreen(!isFullScreen);
  };

  useImperativeHandle(ref, () => ({
    seek: async (timeInSeconds) => {
      const position = timeInSeconds * 1000;
      try {
        await video.current.setPositionAsync(position);
        console.log("Seek successful");
      } catch (error) {
        console.error("Seek failed", error);
      }
    }
  }));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onPinchEvent = (event) => {
    if (event.nativeEvent.scale >= 1 && event.nativeEvent.scale <= 3) {
      const newZoomLevel = event.nativeEvent.scale;
      scale.value = newZoomLevel;
    }
  };

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      scale.value = withTiming(scale.value);
    }
  };

  const fetchCaptions = async () => {
    try {
      const response = await fetch('https://assetsv01.blob.core.windows.net/vestasacademy-container/vtt%20Files/800108_en.vtt');
      const vttText = await response.text();
      const parsedCaptions = parseVTT(vttText);
      setCaptions(parsedCaptions);
    } catch (error) {
      console.error("Error fetching captions:", error);
    }
  };

  useEffect(() => {
    fetchCaptions();
  }, []);

  const updateCaption = () => {
    if (status.positionMillis !== undefined) {
      const currentTime = status.positionMillis / 1000; // Convert to seconds
      const currentCaption = captions.find(cue => {
        const start = parseTime(cue.startTime);
        const end = parseTime(cue.endTime);
        return currentTime >= start && currentTime <= end;
      });
      setCurrentCaption(currentCaption ? currentCaption.text : '');
    }
  };

  useEffect(() => {
    updateCaption();
  }, [status]);

  const parseTime = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':');
    return parseFloat(minutes) * 60 + parseFloat(seconds);
  };

  return (
    <View style={styles.videocontainer}>
      <PinchGestureHandler
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}>
        <Animated.View style={[{ width: videoWidth, height: videoHeight }, animatedStyle]}>
          <Video
            ref={video}
            style={{...styles.video, width : videoWidth }}
            source={source}
            showControls={true}
            useNativeControls={true}
            resizeMode="contain"
            controls={true}
            isLooping={false}
            onPlaybackStatusUpdate={statusUpdate => {
              setStatus(statusUpdate);
              if (onTimeUpdate && statusUpdate.isPlaying) {
                onTimeUpdate(statusUpdate.positionMillis / 1000);
              }
              if(status.didJustFinish) {
                video.current.stopAsync().then(() =>{         
                  video.current.setPositionAsync(0);       
                  setIsPlaying(false); 
                });
              }
            }}
          />
        </Animated.View>
      </PinchGestureHandler>
      {!isPlaying && (
        <TouchableOpacity style={styles.playContainer} onPress={handlePlayPause}>
          <Image source={require("../assets/Play_Icon.png")}/>
        </TouchableOpacity>
      )}
      {currentCaption ? (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{currentCaption}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  videocontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingBottom: 10,
    backgroundColor: "white"
  },
  video: {
    marginTop: 20,
    aspectRatio: 16/9
  },
  playContainer : {
    position : 'absolute',
    top : "40%"
  },
  captionContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  captionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default VideoPlayer;
