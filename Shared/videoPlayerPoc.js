import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity, Text, Image, StatusBar, Platform } from 'react-native';

import Video from 'react-native-video';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import Orientation from 'react-native-orientation-locker';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useWindowDimensions } from 'react-native';
// import SystemNavigationBar from 'react-native-system-navigation-bar';
import Slider from '@react-native-community/slider';

import AudioSubsModal from '../Shared/AudioSubsModal';
import DoubleTap from '../Shared/DoubleTap';
import {getCurrent} from './../util/asyncUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoPlayer = React.forwardRef(({ source, onTimeUpdate = () => {}, onPlayPause = () => {} }, ref) => {
  const videoRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const [orientation, setOrientation] = useState("portrait");
  const [watchTime, setWatchtime] = React.useState(0);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width, height: width * (9 / 16) });
  // const [ccEnabled, setCcEnabled] = useState(true); // Closed Captions state
  // const [playbackRate, setPlaybackRate] = useState(1); // Playback speed state

  const [videoPressed, setVideoPressed] = React.useState(true);
  const [isPaused, setIsPaused] = React.useState(true);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isMute, setisMute] = React.useState(false);
  const [isBuffering, setIsBuffering] = React.useState(true)
  const [progress, setProgress] = React.useState({currentTime:0, seekableDuration:0})

  const [totalAudioTracks, setTotalAudioTracks] = React.useState([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = React.useState(0);
  const [totalSubtitles, setTotalSubtitles] = React.useState([]);
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = React.useState(1);
  const [audioSubsModalVisible, setAudioSubsModalVisible] = React.useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedPlaybackSpeed, setSelectedPlaybackSpeed] = useState(1);

  const [full, setFull] = useState(false);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isZooming = useSharedValue(false);
 
  const pinchGesture = Gesture.Pinch()
  .onStart(() => {
    isZooming.value = true; 
    runOnJS(setVideoPressed)(false); 
  })
    .onUpdate((event) => {
      scale.value = Math.max(1, event.scale); 
    })
    .onEnd(() => {
      scale.value = Math.max(1, Math.min(scale.value, 3)); 
      if (scale.value === 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
      runOnJS(setVideoPressed)(true); 
      isZooming.value = false; 
    });
 
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      const maxTranslateX = (screenWidth * (scale.value - 1)) / 2;
      const maxTranslateY = (screenHeight * (scale.value - 1)) / 2;
      translateX.value = Math.max(-maxTranslateX, Math.min(translateX.value, maxTranslateX));
      translateY.value = Math.max(-maxTranslateY, Math.min(translateY.value, maxTranslateY));
    });
 
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);
 
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      // { translateY: translateY.value },
    ],
  }));

  useEffect(() => {
    const handleOrientationChange = () => {
      const { width, height } = Dimensions.get('window');
      const aspectRatio = 16 / 9;
      const newHeight = width / aspectRatio;
      if (isFullScreen) {
        setVideoDimensions({ width: height, height: width });
      } else {
        setVideoDimensions({ width: width, height: newHeight });
      }
      setOrientation(width > height ? 'landscape' : 'portrait');
      StatusBar.setHidden(width>height, 'fade');
    };
    //const subscription = Dimensions.addEventListener('change', handleOrientationChange);
   return () => {
     //subscription?.remove();
   };
 }, [isFullScreen]);



  updateSubtitle = (index) => {
    console.log(index)
    setSelectedSubtitleTrack(index)
  }

  const handleEnterFullscreen = async () => {
    try {
      setIsFullScreen(true);
      //videoRef.current.presentFullscreenPlayer();
      // StatusBar.setHidden(true);
      // if (Platform.OS === 'android') {
      //   await Orientation.lockToLandscape();
      // } else {
      //   Orientation.lockToLandscapeRight();
      // }
    } catch (error) {
      console.error('Error entering fullscreen or locking orientation:', error);
    }
  };
  const handleExitFullscreen = async () => {
    try {
      setIsFullScreen(false);
     // videoRef.current.dismissFullscreenPlayer();
      // StatusBar.setHidden(false);
      // if (Platform.OS === 'android') {
      //   await Orientation.lockToPortrait();
      // } else {
      //   Orientation.lockToPortrait();
      // }
    } catch (error) {
      console.error('Error exiting fullscreen or unlocking orientation:', error);
    }
  };
  const handleApplyChanges = () => {
    setPlaybackRate(selectedPlaybackSpeed); 
    setAudioSubsModalVisible(false); 
  };

  useImperativeHandle(ref, () => ({
    play: handlePlayVideo,
    pause: handlePauseVideo,
    seek:  (timeInSeconds) => {
      if (videoRef.current) {
        videoRef.current.seek(timeInSeconds);
      }
    }
  }));

  const fastForward = () => {
    if (videoRef.current?.state?.currentTime) {
      seekToPosition(videoRef.current?.state?.currentTime + 10);
    }
  };

  const rewind = () => {
    if (videoRef.current?.state?.currentTime) {
      seekToPosition(videoRef.current?.state?.currentTime - 10);
    }
  };

  const openAudioSubsModal = () => {
    handlePauseVideo()
    setAudioSubsModalVisible(true);
  };

  const seekToPosition = (time) => {
    console.log(time);
    if (videoRef.current?.player?.ref) {
      const seekMethod = videoRef.current.player.ref.seek;
      seekMethod(time);
    }
  };

  const toggleCC = () => {
    setCcEnabled(prev => !prev);
  };

  const changePlaybackRate = () => {
    setPlaybackRate(prev => (prev === 1 ? 1.5 : 1));
  };


  const handleVideoPressed = () => {
    setVideoPressed(!videoPressed)
  }

  const handlePlayVideo = () => {
    setIsPaused(false);
    onPlayPause(true);
    setIsVideoEnded(false);
  }

  const handlePauseVideo = () => {
    setIsPaused(true);
    onPlayPause(false);
  }

  const handleVolumeUp = () => {
    setisMute(false)
  }

  const handleMute = () => {
    setisMute(true)
  }

  const handleVideoEnd = () =>{
    videoRef.current.seek(0);
    setIsVideoEnded(true);
    setIsPaused(true);
    onTimeUpdate(0); 
    setProgress({...progress, currentTime: 0});
  }

  const applyAudioSubsChanges = () => {
    handlePlayVideo()
    setPlaybackRate(selectedPlaybackSpeed); 
    setAudioSubsModalVisible(false);
  };

  const cancelAudioSubsChanges = () => {
    handlePlayVideo()
    setAudioSubsModalVisible(false);
  };

  const moveBackward = () => {
    videoRef.current.seek(parseInt(progress.currentTime - 10))
  }

  const moveForward = () => {
    videoRef.current.seek(parseInt(progress.currentTime + 10))
  }

  const formatDuration = (durationInSeconds) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = `${minutes < 10 && hours > 0 ? '0' : ''}${minutes}:`;
    const formattedSeconds = `${seconds < 10 ? '0' : ''}${seconds}`;

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };

  const onPinchEvent = (event) => {
    console.log(event)

    setScale(event.nativeEvent.scale);
  };

  const onPinchStateChange = (event) => {
    console.log(event)
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setScale(event.nativeEvent.scale);
    }
  };

  updateSubtitle = (index) => {
    setSelectedSubtitleTrack(index)
}
  const renderVideoControls = () => (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.videoWrapper, animatedStyle]}>

        <AudioSubsModal
          visible={audioSubsModalVisible}
          audioTracks={totalAudioTracks}
          selectedAudioTrack={selectedAudioTrack}
          onSelectAudio={(index) => setSelectedAudioTrack(index)}
          subtitles={totalSubtitles}
          selectedSubtitle={selectedSubtitleTrack}
          onSelectSubtitle={(index) => setSelectedSubtitleTrack(index)}
          playbackSpeedOptions={[0.5, 0.75, 1, 1.25, 1.5, 2]} 
          selectedPlaybackSpeed={selectedPlaybackSpeed}
          onSelectPlaybackSpeed={(speed) => setSelectedPlaybackSpeed(speed)}
          // onApply={handleApplyChanges}
          onApply={applyAudioSubsChanges}
          onCancel={cancelAudioSubsChanges}
          dimension={videoDimensions}
        />

        <TouchableOpacity
          style={[styles.videoContainer, { width: videoDimensions.width, height: videoDimensions.height }]}
          onPress={() => setIsPaused(!isPaused)}
        >
          <Animated.View style={[styles.video, animatedStyle]}>
            <Video
              ref={videoRef}
              rate={playbackRate}
              source={source}
              muted={isMute}
              //fullscreenAutorotate={true} 
              fullscreen={full}
              onFullscreenPlayerDidDismiss={()=>setFull(false)}
              onFullscreenPlayerWillPresent={(e)=>{console.log('event: ', e.selectedAudioTrack)}}
              paused={isPaused}
              resizeMode="contain" 
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
              // textTracks = {textTracks}
              // subtitleStyle={{ paddingBottom: 10, fontSize: 20, opacity: 0 }}
              //selectedTextTrack={{ type: 'title', value: 'English' }} 

              backBufferDurationMs={15000}

              onLoad={ async (videoInfo) => {
                console.log('Video Loaded...', videoInfo);
                if (watchTime > 0) {
                  videoRef.current.seek(watchTime);
                }
                const lang = await getCurrent();
                console.log('getCurrent from video: ', lang?.lang)
                const allSubtitles = [];

                // const allSubtitles = videoInfo.textTracks.map((track, index) => ({
                //   ...track,
                //   index: index + 1,
                //   selected: lang?.lang?.toLowerCase() == track?.language?.toLowerCase() ? true : false
                // }));  
               videoInfo.textTracks.map((track, index) => {
                  if((index%2)== 1){
                    allSubtitles.push(track) 
                  }
                }); 
                allSubtitles?.map((track, index)=>{
                  if(lang?.lang?.toLowerCase() == track?.language?.toLowerCase()){
                    allSubtitles[index].selected = true;
                    setSelectedSubtitleTrack(index);
                  }
                })
                //(lang?.lang?.toLowerCase() == track?.language?.toLowerCase()) && 
                // const allAudios_ = videoInfo.audioTracks.map((audio, index) => ({
                //   ...audio,
                //   //index: index + 1,
                //   selected: lang?.lang?.toLowerCase() == audio?.title.toLowerCase() ? setSelectedAudioTrack(index) : false
                  
                // })); 
                const allAudios = videoInfo.audioTracks.map((audio, index) => {
                  audio['language'] = audio?.title?.toLowerCase(); 
                  if(lang?.lang?.toLowerCase() == audio?.title.toLowerCase()){
                    audio.selected=true;
                    setSelectedAudioTrack(index);
                    console.log('audio: ', audio);
                    return audio;
                  }
                  audio.selected = false;
                  return audio;
                }); 
                const offSubtitle = {
                  index: allSubtitles.length + 1, // Put it after the existing subtitles
                  language: 'Off',
                  selected: false,
                  title: 'Off',
                  type: 'application/x-subrip', 
                };

                allSubtitles.push(offSubtitle);

                setTotalSubtitles(allSubtitles);
                //setTotalAudioTracks(videoInfo.audioTracks);
                setTotalAudioTracks(allAudios);
                console.log('getCurrent from allSubtitles: ', allSubtitles)
                console.log('getCurrent from allAudios: ', allAudios);
                
                setProgress((prevProgress) => ({
                  ...prevProgress,
                  seekableDuration: videoInfo.duration,
                }));
              }}
              onBuffer={(bufferValue) => {
                console.log('Video Buffering onb', bufferValue.isBuffering);
                setIsBuffering(bufferValue.isBuffering);
              }}
              selectedAudioTrack={{
                type: "index",
                value: selectedAudioTrack
              }}
              selectedTextTrack={{
                type: "index",
                value: selectedSubtitleTrack
              }}
              // ref={videoRef}
              onProgress={({ currentTime }) => {           
                setProgress((prevProgress) => ({...prevProgress, currentTime}));
                onTimeUpdate(currentTime);   
              }}
              onEnd={handleVideoEnd}
              // resizeMode={'none'}
              style={styles.video}
            />
          </Animated.View>

          <TouchableOpacity
            onPress={() => handleVideoPressed()}
            style={[
              styles.videoscreenContainer,
              { height: '100%',width: '100%', backgroundColor: videoPressed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)' },
            ]}
          >
            {!isBuffering  ? (
              <View style={{ opacity: videoPressed ? 1 : 0, flexDirection: 'row', zIndex: -1, justifyContent: 'center', alignItems: 'center' }}>
                {/* Playback control buttons */}
                {videoPressed && !isZooming.value && (
                <>
                  <TouchableOpacity onPress={() => moveBackward()}>
                    <Image
                      source={require('../assets/backward.png')}
                      style={{ width: 30, height: 30, tintColor: 'white' }}
                    />
                  </TouchableOpacity>
                  
                  {isPaused ? (
                    <TouchableOpacity onPress={handlePlayVideo}>
                      <Image
                        source={require('../assets/play.png')}
                        style={{
                          width: 50,
                          height: 50,
                          tintColor: 'white',
                          marginRight: responsiveWidth(15),
                          marginLeft: responsiveWidth(15),
                        }}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handlePauseVideo}>
                      <Image
                        source={require('../assets/pause.png')}
                        style={{
                          width: 50,
                          height: 50,
                          tintColor: 'white',
                          marginRight: responsiveWidth(15),
                          marginLeft: responsiveWidth(15),
                        }}
                      />
                    </TouchableOpacity>
                  )}
  
                  <TouchableOpacity onPress={() => moveForward()}>
                    <Image
                      source={require('../assets/forward.png')}
                      style={{ width: 30, height: 30, tintColor: 'white' }}
                    />
                  </TouchableOpacity>
                </>
                )}
              </View>
            ) : (
              <LottieView
                style={{ width: responsiveWidth(30), height: responsiveHeight(30) }}
                source={require('../assets/playerloading.json')}
                autoPlay
                loop
              />
            )}

            <View style={[styles.backButtonContainer, { opacity: videoPressed ? 1 : 0 }]} />

            <DoubleTap position={'left'} onDoubleTap={moveBackward} />
            <DoubleTap positionStyle={'right'} onDoubleTap={moveForward} />
          </TouchableOpacity>
        </TouchableOpacity>
        {videoPressed && !isZooming.value && (    
        <View style={[styles.sliderContainer, { opacity: videoPressed ? 1 : 0 }]}>
          <TouchableOpacity onPress={() => setisMute(!isMute)}>
             <Image
               source={isMute ? require('../assets/mute.png') : require('../assets/volume.png')}
               style={styles.volControlIcon}
             />
          </TouchableOpacity>
          <Text style={styles.sliderText}>{formatDuration(progress.currentTime)}</Text>
          <Slider
            style={styles.sliderProgressBar}
            minimumValue={0}
            maximumValue={progress.seekableDuration}
            minimumTrackTintColor="#4BA6F7"
            maximumTrackTintColor="white"
            thumbTintColor="#4BA6F7"
            onValueChange={(prog) => {
              videoRef.current.seek(prog);
            }}
            value={progress.currentTime}
          />

          <Text style={styles.sliderText}>{formatDuration(progress.seekableDuration - progress.currentTime)}</Text>
          <TouchableOpacity style={styles.fullscreenButton} 
          //onPress={orientation === 'portrait' ? handleEnterFullscreen : handleExitFullscreen}
          onPress={()=>setFull(true)}
          >
            <Icon name={orientation === 'portrait' ? "zoom-out-map" : "zoom-in-map"} size={20} color="white" />
          </TouchableOpacity>
        </View>
        )}
        {videoPressed && !isZooming.value && ( 
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.audioSubsButton}
            onPress={openAudioSubsModal}
          >
            <Image
              source={require('../assets/Equalizer.png')}
              style={styles.controlIcon}
            />
          </TouchableOpacity>
        </View>
        )}
      </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>

  );

  return orientation !== "portrait" ? (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      // style={[{ width: '100%', height: '100%' }]}
      // onRequestClose={() => setIsFullScreen(false)}
      onRequestClose={() => handleExitFullscreen()}
      // onDismiss={() => setIsFullScreen(false)}
    >
      <View style={[styles.container, styles.fullscreenContainer]}>
        {renderVideoControls()}
      </View>
    </Modal>
  ) : (
    <View style={styles.container}>
      {renderVideoControls()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
  },
  fullscreenContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  videoWrapper: {
    justifyContent: 'center', 
    alignItems: 'center',  
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  videoContainer: {
    justifyContent: 'center',  
    alignItems: 'center', 
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    position: 'absolute',
    top: 100,
    zIndex: 1,
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
  },
  videoscreenContainer: {
    // backgroundColor: 'green',
    width: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    // backgroundColor:'red',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    paddingLeft: 10,
    paddingRight: 10,
    zIndex: 1999
  },
  goBackIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  movieTitleText: {
    color: 'white',
    flex: 1,
    textAlign: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
  },

  audioSubText: {
    color: 'white',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    marginLeft: 8
  },

  audioSubsIconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  sliderContainer: {
    // backgroundColor: 'blue',
    width: '95%',
    // height: '25%',
    flexDirection: 'row',
    position: 'absolute',
    bottom: '5%',
    alignItems: 'center',
    alignSelf: 'center'
  },

  sliderProgressBar: {
    flex: 1,
    color: 'red',
    height: 30,
    // bottom: 40
  },
  sliderText: {
    color: 'white',
    marginHorizontal: 1
    // bottom: 40
  },
  thumbStyle: {
    width: 10,  
    height: 10, 
    borderRadius: 10, 
    backgroundColor: '#FF0000' 
  },
  fullscreenButton: {
    marginLeft: 15, 
    marginRight: 10
  },
  topControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // volumeControlArea: {
  //   // backgroundColor:'green',
  //   position: 'absolute',
  //   right: 0,
  //   top: 0,
  //   bottom: 0,
  //   width: '20%',
  // },
  // controlsContainer: {
  //   width: '85%',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   position: 'absolute',
  //   bottom: '5%', 
  //   paddingHorizontal: 20,
  // },
  volControlIcon:{
    width: 20,
   height: 20,
   tintColor: 'white',
   marginLeft: 5,
   marginRight: 15
  },
  controlIcon: {
    width: 20,
   height: 20,
   tintColor: 'white',
   marginLeft: 15,
  },
  audioSubsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioSubText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  playbackSpeedModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playbackSpeedOptions: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  playbackSpeedOptionText: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default VideoPlayer;
