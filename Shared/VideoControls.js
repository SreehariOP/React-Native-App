import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

const VideoControls = (props) => {
  const { state, togglePlay, playbackInstanceInfo, setPlaybackInstanceInfo, playbackInstance } = props;

  function renderIcon() {
    if (state.isBuffering) {
      return <ActivityIndicator size={20} color="white" />;
    } else if (state.shouldPlay) {
      return <FontAwesome name="pause" size={18} color="#fff" />;
    } else {
      return <FontAwesome name="play" size={20} color="#fff" />;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {renderIcon()}
        <Slider
          style={styles.slider}
          thumbTintColor={"#fff"}
          minimumTrackTintColor={"red"}
          maximumTrackTintColor="#8E9092"
          value={playbackInstanceInfo.duration ? playbackInstanceInfo.position / playbackInstanceInfo.duration : 0}
          onSlidingStart={() => {
            if (playbackInstanceInfo.state === 'Playing') {
              togglePlay();
              setPlaybackInstanceInfo({ ...playbackInstanceInfo, state: 'Paused' });
            }
          }}
          onSlidingComplete={async (e) => {
            const position = e * playbackInstanceInfo.duration;
            if (playbackInstance) {
              await playbackInstance.setStatusAsync({
                positionMillis: position,
                shouldPlay: true,
              });
            }
            setPlaybackInstanceInfo({
              ...playbackInstanceInfo,
              position,
            });
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingRight: 20,
    width: '100%',
    height: 66,
  },
  slider: {
    flex: 1,
    marginHorizontal: 20,
  },
});

export default VideoControls;
