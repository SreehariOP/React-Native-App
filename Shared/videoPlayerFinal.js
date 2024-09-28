import { View, Text, StatusBar, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React,{useEffect} from 'react'
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import Slider from '@react-native-community/slider';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { responsiveHeight, responsiveWidth, responsiveFontSize } from "react-native-responsive-dimensions";
import LottieView from 'lottie-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import VerticalSlider from 'rn-vertical-slider-matyno';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { VolumeManager } from 'react-native-volume-manager';
import { setBrightnessLevel, getBrightnessLevel } from '@reeq/react-native-device-brightness';
import AudioSubsModal from '../Shared/AudioSubsModal';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import DoubleTap from '../Shared/DoubleTap';
import DeviceInfo from 'react-native-device-info';
import fs from "react-native-fs";

export default function VideoPlayerFinal({ source, onTimeUpdate, isFocused }) {
    console.log(source)

    const navigation = useNavigation();
    
    const [videoPressed, setVideoPressed] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const [isMute, setisMute] = React.useState(true);
    const [progress, setProgress] = React.useState(0)
    const [totalAudioTracks, setTotalAudioTracks] = React.useState([]);
    const [selectedAudioTrack, setSelectedAudioTrack] = React.useState(0);
    const [totalSubtitles, setTotalSubtitles] = React.useState([]);
    const [selectedSubtitleTrack, setSelectedSubtitleTrack] = React.useState(0);
    const [audioSubsModalVisible, setAudioSubsModalVisible] = React.useState(false);
    const [isBuffering, setIsBuffering] = React.useState(true)
    const [watchTime, setWatchtime] = React.useState(0);
    const [resizeMode, setResizeMode] = React.useState("cover");
    const [volume, setVolume] = React.useState(0.5);
    const [brightness, setBrightness] = React.useState(0.5);
    const [isTablet, setIsTablet] = React.useState(false)
    const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
    const sliderTimeout = React.useRef(null);

    const ref = React.useRef();


    // useEffect(() => {
    //     const loadSubtitles = async () => {
    //       const subtitlePath = fs.DocumentDirectoryPath+'/assets/video/5.1.1/subtitle';
    //       console.log(await fs.readDir(fs.DocumentDirectoryPath))

    //       try {
    //         const files = await fs.readDir(subtitlePath);
    //         const vttFiles = files.filter(file => file.name.endsWith('.vtt'));
    //         console.log(files,vttFiles)

    //         const subtitlesList = vttFiles.map(file => ({
    //           title: file.name.split('.')[0], // e.g., 'en-US' => 'en-US'
    //           language: file.name.split('.')[0],
    //           type: 'text/vtt',
    //           uri: `file://${file.path}`, // Use file:// URI scheme for local files
    //         }));
    //         setTextTracks(subtitlesList);
    //       } catch (error) {
    //         console.error('Error loading subtitles:', error);
    //       }
    //     };
    
    //     loadSubtitles();
    //   }, []);   
    const openAudioSubsModal = () => {
        handlePauseVideo()
        setAudioSubsModalVisible(true);
    };

    const applyAudioSubsChanges = () => {
        // Apply changes based on selectedAudioTrack and selectedSubtitleTrack
        handlePlayVideo()
        setAudioSubsModalVisible(false);
    };

    const cancelAudioSubsChanges = () => {
        // Reset changes or perform any necessary actions
        handlePlayVideo()
        setAudioSubsModalVisible(false);
    };

    React.useEffect(() => {
        if (DeviceInfo.getDeviceType() === "Tablet") {
            setIsTablet(true)
        }
    }, [])

    React.useEffect(() => {
        // Lock the orientation to landscape when the component mounts
        Orientation.lockToLandscape();
        SystemNavigationBar.fullScreen(true);
        if (DeviceInfo.getDeviceType() === "Tablet") {
            setIsTablet(true)
        }

        return () => {
            // Unlock orientation and exit full screen when component unmounts
            console.log("Device info is that", isTablet)
            if (!isTablet) {
                Orientation.lockToPortrait();
                SystemNavigationBar.fullScreen(false);
                console.log("Screen is portrait")
            }
            handleExitVideoPlayerBrightness()
        };

    }, [isTablet]);


    // useFocusEffect(
    //     React.useCallback(() => {
    //         const fetchWatchedTime = async () => {
    //             try {
    //                 const response = await getWatchtime(movieID);
    //                 console.log("Movie watchtime", response)
    //                 setWatchtime(response.watchedTime);
    //             } catch (error) {
    //                 console.error('Error fetching show watched time', error);
    //             }
    //         };

    //         fetchWatchedTime();
    //     }, [movieID])
    // );

    React.useEffect(() => {

        const setVideoplayerStartupBrightness = async () => {
            setBrightnessLevel(brightness)
        }

        setVideoplayerStartupBrightness()

    }, []);


    const handleVolumeChange = async (value) => {
        VolumeManager.showNativeVolumeUI({ enabled: false });
        await VolumeManager.setVolume(value);
        setVolume(value)
        // Get the current volume async
        const { volume } = await VolumeManager.getVolume();
        console.log(volume)
    }

    const handleExitVideoPlayerBrightness = async () => {
        try {
            // Reset brightness to system brightness level
            setBrightnessLevel(0.4, false);
        } catch (err) {
            console.log(err);
        }
    };

    const handleBrightnessChange = async (value) => {
        setBrightnessLevel(value, true);
        setBrightness(value)
        const brightness = await getBrightnessLevel();
        console.log("Brightness", brightness);

    }

    const handleVideoPressed = () => {
        setVideoPressed(!videoPressed)
        SystemNavigationBar.fullScreen(true);
    }

    const handlePlayVideo = () => {
        console.log("Video Playing")
        setIsPaused(false)
    }

    const handlePauseVideo = () => {
        console.log("Video paused")
        setIsPaused(true)
    }

    const handleVolumeUp = () => {
        setisMute(false)
    }

    const handleMute = () => {
        setisMute(true)
    }

    const moveBackward = () => {
        ref.current.seek(parseInt(progress.currentTime - 10))
    }

    const moveForward = () => {
        ref.current.seek(parseInt(progress.currentTime + 10))
    }

    // const handleUpdateMovieWatchtime = async (watchedTime, movieID) => {

    //     if (!isNaN(watchedTime)) {
    //         await updateWatchtime(watchedTime, movieID)
    //     }
    // }

    const handleZoomIn = () => {
        setResizeMode("none")
    }

    const handleZoomOut = () => {
        setResizeMode("cover")
    }

    const goBack = () => {
        console.log("Videoplayer current time on the video", parseInt(progress.currentTime))
        // handleUpdateMovieWatchtime(parseInt(progress.currentTime), movieID)
        navigation.goBack();
        // if (!isTablet) {
        //     Orientation.lockToPortrait();
            SystemNavigationBar.fullScreen(false);
        // }

        handleExitVideoPlayerBrightness()
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

    const handleVolumeGesture = ({ nativeEvent }) => {

        if (nativeEvent.state === State.ACTIVE) {
            // console.log("Volume native",nativeEvent.translationY)
            const sensitivity = 10000;
            const newVolume = volume - nativeEvent.translationY / sensitivity;
            const clampedVolume = Math.max(0, Math.min(1, newVolume));
            handleVolumeChange(clampedVolume);
            setShowVolumeSlider(true);

            if (sliderTimeout.current) {
                clearTimeout(sliderTimeout.current);
            }

            sliderTimeout.current = setTimeout(() => {
                setShowVolumeSlider(false);
            }, 2000);
        }
    };

    updateSubtitle = (index) => {
        console.log(index)
        setSelectedSubtitleTrack(index)
    }

    // useEffect(() => {
    //     // Assuming the VTT file is located in the assets/subtitles directory
    //     const getLocalSubtitleUri = async () => {
    //       const subtitlePath = RNFS.DocumentDirectoryPath + '/video/5.1.1/subtitles/en_us.vtt';
    //       console.log(subtitlePath)
    //       setSelectedSubtitleTrack(subtitlePath);
    //     };
    
    //     getLocalSubtitleUri();
    //   }, []);
    

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar hidden />

            <AudioSubsModal
                visible={audioSubsModalVisible}
                audioTracks={totalAudioTracks}
                selectedAudioTrack={selectedAudioTrack}
                onSelectAudio={(index) => setSelectedAudioTrack(index)}
                subtitles={totalSubtitles}
                selectedSubtitle={selectedSubtitleTrack}
                onSelectSubtitle={(index) => updateSubtitle(index)}
                onApply={applyAudioSubsChanges}
                onCancel={cancelAudioSubsChanges}
            />

            <PanGestureHandler>
                <TouchableOpacity style={styles.backgroundVideo} >
                    <Video
                         source={source}
                        muted={isMute}
                        paused={isPaused}
                        bufferConfig={{
                            minBufferMs: 15000,
                            maxBufferMs: 50000,
                            bufferForPlaybackMs: 2500,
                            bufferForPlaybackAfterRebufferMs: 5000
                        }}
                        backBufferDurationMs={15000}
                        onLoad={async(videoInfo) =>  {
                            console.log("Video Loaded...", videoInfo)
                            if (watchTime > 0) {
                                ref.current.seek(watchTime);
                            }
                            
                            // Load subtitle files from assets directory
                            // const ccdirectoryPath = `${fs.MainBundlePath}/assets/video/subtitle/5.1.1`;
                            // console.log(await fs.readDir(fs.MainBundlePath))
                            // try {
                            //   const files = await fs.readDir(ccdirectoryPath);
                            //   const vttFiles = files.filter(file => file.name.endsWith('.vtt'));
                
                            //   const allSubtitles = vttFiles.map((file, index) => ({
                            //     index: index + 1,
                            //     language: file.name.split('.')[0], // e.g., 'en', 'es'
                            //     uri: `assets/video/subtitle/5.1.1/${file.name}`
                            //   }));
                
                            //   const offSubtitle = {
                            //     index: allSubtitles.length + 1,
                            //     language: 'Off',
                            //     selected: false,
                            //     title: 'Off',
                            //     type: 'application/x-subrip',
                            //   };
                
                            //   setTotalSubtitles([...allSubtitles, offSubtitle]);
                            //   setTotalAudioTracks(videoInfo.audioTracks);
                            // } catch (error) {
                            //   console.log("Error loading subtitles: ", error);
                            // }

                            // const subtitles = [
                            //     {
                            //         title: 'English',
                            //         language: 'en',
                            // type: TextTrackType.VTT, // "text/vtt"

                            //         uri: 'asset:///video/5.1.1/subtitle/en_us.vtt',
                            //     },
                            //     {
                            //         title: 'Spanish',
                            //         language: 'es',
                            //         uri: 'assets/video/5.1.1/subtitle/en_sp.vtt',
                            //     },{
                            //         title: 'Portuguese',
                            //         language: 'pt',
                            //         uri: 'assets/video/5.1.1/subtitle/en_pt.vtt',
                            //     }
                            //     // {
                            //     //     title: 'Spanish',
                            //     //     language: 'es',
                            //     //     uri: require('../assets/subtitles/spanish.vtt'),
                            //     // },
                            //     // {
                            //     //     title: 'Portuguese',
                            //     //     language: 'pt',
                            //     //     uri: require('../assets/subtitles/portuguese.vtt'),
                            //     // },
                            // ];
                        

                            const allSubtitles = videoInfo.textTracks.map((track, index) => ({
                                ...track,
                                index: index + 1,
                            }));

                            const offSubtitle = {
                                index: allSubtitles.length + 1, // Put it after the existing subtitles
                                language: "Off",
                                selected: false,
                                title: "Off",
                                type: "application/x-subrip",
                            };

                            allSubtitles.push(offSubtitle);

                            setTotalSubtitles(allSubtitles);
                            setTotalAudioTracks(videoInfo.audioTracks);
                        }}

                        onBuffer={(bufferValue) => {
                            console.log("Video Buffering onb", bufferValue.isBuffering);
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
                        ref={ref}
                        onProgress={prog => {
                            // console.log(prog);
                            setProgress(prog)
                        }}
                        resizeMode={resizeMode}
                        style={{ width: '100%', height: '100%' }} />

                    <TouchableOpacity
                        onPress={() => handleVideoPressed()}
                        style={[styles.videoscreenContainer, { height: '100%', backgroundColor: videoPressed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)' }]}>


                        {
                            !isBuffering ? (
                                <View style={{ opacity: videoPressed ? 1 : 0, flexDirection: 'row', zIndex: -1, }}>
                                    <TouchableOpacity onPress={() => moveBackward()}>
                                        <Image source={require('../assets/backward.png')} style={{ width: 50, height: 50, tintColor: 'white' }} />
                                    </TouchableOpacity>

                                    {
                                        isPaused ? (<TouchableOpacity onPress={() => handlePlayVideo()}>
                                            <Image source={require('../assets/play.png')} style={{ width: 50, height: 50, tintColor: 'white', marginRight: responsiveWidth(15), marginLeft: responsiveWidth(15) }} />
                                        </TouchableOpacity>) :
                                            <TouchableOpacity onPress={() => handlePauseVideo()}>
                                                <Image source={require('../assets/pause.png')} style={{ width: 50, height: 50, tintColor: 'white', marginRight: responsiveWidth(10), marginLeft: responsiveWidth(10) }} />
                                            </TouchableOpacity>
                                    }

                                    <TouchableOpacity onPress={() => moveForward()}>
                                        <Image source={require('../assets/forward.png')} style={{ width: 50, height: 50, tintColor: 'white', }} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <LottieView style={{ width: responsiveWidth(30), height: responsiveHeight(30) }} source={require('../assets/playerloading.json')} autoPlay loop />
                            )
                        }


                        <View
                            style={[styles.backButtonContainer, { opacity: videoPressed ? 1 : 0, }]}>
                            <TouchableOpacity onPress={() => goBack()}>
                                <Image source={require('../assets/back.png')} style={styles.goBackIcon} />
                            </TouchableOpacity>
                            <Text style={styles.movieTitleText}>{"test"}</Text>
                        </View>

                        <DoubleTap position={"left"} onDoubleTap={moveBackward} />
                        <DoubleTap positionStyle={"right"} onDoubleTap={moveForward} />


                        <View style={{
                            // backgroundColor: 'green',
                            width: '15%',
                            height: '40%',
                            flexDirection: 'column',
                            gap: 10,
                            position: 'absolute',
                            bottom: 120,
                            left: 0,
                            // marginLeft:60,
                            paddingLeft: 60,
                            paddingRight: 0,
                            alignItems: 'center',
                            opacity: videoPressed ? 1 : 0
                        }}>
                            <Icon name="brightness-7" size={30} color="white" />
                            <VerticalSlider
                                style={{ paddingLeft: 50 }}
                                value={brightness}
                                disabled={false}
                                min={0.1}
                                max={1}
                                onChange={handleBrightnessChange}
                                width={20}
                                height={100}
                                step={0.1}
                                borderRadius={2}
                                minimumTrackTintColor={"tomato"}
                                maximumTrackTintColor={"gray"}
                            />
                        </View>

                        <PanGestureHandler onGestureEvent={handleVolumeGesture}>
                            <View style={styles.volumeControlArea} />
                        </PanGestureHandler>

                        <View style={{
                            // backgroundColor: 'green',
                            width: '15%',
                            height: '40%',
                            flexDirection: 'column',
                            gap: 10,
                            position: 'absolute',
                            bottom: 120,
                            right: 0,
                            paddingLeft: 0,
                            paddingRight: 60,
                            alignItems: 'center',
                            opacity: videoPressed || showVolumeSlider ? 1 : 0
                        }}>
                            <Icon name="volume-up" size={30} color="white" />
                            <VerticalSlider
                                value={volume}
                                disabled={false}
                                min={0.1}
                                max={1}
                                onChange={handleVolumeChange}
                                width={20}
                                height={100}
                                step={0.1}
                                borderRadius={2}
                                minimumTrackTintColor={"tomato"}
                                maximumTrackTintColor={"gray"}
                            />
                        </View>

                        {
                            !isBuffering && (
                                <View
                                    style={[styles.audioSubsIconContainer, { opacity: videoPressed ? 1 : 0 }]}>
                                    {
                                        isMute ? (<TouchableOpacity onPress={() => handleVolumeUp()}>
                                            <Image source={require('../assets/mute.png')} style={{ width: 30, height: 30, tintColor: 'white' }} />
                                        </TouchableOpacity>) : (<TouchableOpacity onPress={() => handleMute()}>
                                            <Image source={require('../assets/volume.png')} style={{ width: 30, height: 30, tintColor: 'white' }} />
                                        </TouchableOpacity>)
                                    }


                                    <TouchableOpacity style={{ marginRight: 20, flexDirection: 'row', alignItems: 'center' }} onPress={openAudioSubsModal}>
                                        <Image source={require('../assets/subtitles.png')} style={{ width: 30, height: 30, tintColor: 'white' }} />
                                        <Text style={styles.audioSubText}>Audio & Subtitles</Text>
                                    </TouchableOpacity>

                                    {
                                        resizeMode === "cover" ? (<TouchableOpacity onPress={() => handleZoomIn()}>
                                            <Icon name="zoom-in-map" size={30} color="white" />
                                        </TouchableOpacity>) : (<TouchableOpacity onPress={() => handleZoomOut()}>
                                            <Icon name="zoom-out-map" size={30} color="white" />
                                        </TouchableOpacity>)
                                    }

                                </View>
                            )
                        }
                    </TouchableOpacity>
                </TouchableOpacity>
            </PanGestureHandler>

            <View style={[styles.sliderContainer, { opacity: videoPressed ? 1 : 0, }]}>
                <Text style={styles.sliderText}>{formatDuration(progress.currentTime)}</Text>
                <Slider
                    style={styles.sliderProgressBar}
                    minimumValue={0}
                    maximumValue={progress.seekableDuration}
                    minimumTrackTintColor="red"
                    maximumTrackTintColor="white"
                    thumbTintColor="red"
                    onValueChange={(prog) => {
                        ref.current.seek(prog);
                    }}
                    value={progress.currentTime}
                />

                <Text style={styles.sliderText}>{formatDuration(progress.seekableDuration - progress.currentTime)}</Text>
            </View>
        </GestureHandlerRootView>
    )
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
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
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'absolute',
        top: 15,
        paddingLeft: 20,
        paddingRight: 20,
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
        fontSize: responsiveFontSize(2.2),
        fontWeight: 'bold',
        marginLeft: 8
    },

    audioSubsIconContainer: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
    },
    sliderContainer: {
        // backgroundColor: 'blue',
        width: '90%',
        // height: '25%',
        flexDirection: 'row',
        position: 'absolute',
        bottom: '20%',
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },

    sliderProgressBar: {
        flex: 1,
        color: 'red',
        // bottom: 40
    },
    sliderText: {
        color: 'white',
        // bottom: 40
    },
    volumeControlArea: {
        // backgroundColor:'green',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '20%',
    },

});