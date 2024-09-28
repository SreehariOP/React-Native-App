// AudioSubsModal.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const AudioSubsModal = ({ visible, audioTracks, selectedAudioTrack, onSelectAudio, subtitles, selectedSubtitle, onSelectSubtitle, playbackSpeedOptions, selectedPlaybackSpeed, onSelectPlaybackSpeed, onClose, onApply, onCancel, dimension }) => {
  console.log(dimension)
  return (
    <Modal visible={visible} transparent={true} statusBarTranslucent={true} animationType="slide">
      <View style={[styles.modalContainer]}>
        <View style={[styles.modalContent, { width: dimension.width, height: dimension.height  }]}>
          <View style={styles.column}>
            <Text style={styles.modalTitle}>Audio</Text>
            <ScrollView style={styles.tracksContainer}>
              {audioTracks.map((track, index) => (
                <TouchableOpacity key={index} onPress={() => onSelectAudio(index)}>
                  <View style={[styles.trackItem, { backgroundColor: selectedAudioTrack === index ? '#555' : 'transparent' }]}>
                    <Text style={styles.trackText}>{`Audio ${index + 1} - ${track.language}`}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.column}>
            <Text style={styles.modalTitle}>Subtitles</Text>
            <ScrollView style={styles.tracksContainer}>
              {subtitles.map((subtitle, index) => (
                <TouchableOpacity key={index} onPress={() => onSelectSubtitle(index)}>
                  <View style={[styles.trackItem, { backgroundColor: selectedSubtitle === index ? '#555' : 'transparent' }]}>
                    <Text style={styles.trackText}>{`Sub ${index + 1} - ${subtitle.language}`}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.column}>
            <Text style={styles.modalTitle}>Speed</Text>
              <ScrollView style={[styles.tracksContainer, {marginBottom: 35}]}>
                {playbackSpeedOptions.map((speed) => (
                  <TouchableOpacity key={speed} onPress={() => onSelectPlaybackSpeed(speed)}>
                    <View style={[styles.trackItem, { backgroundColor: selectedPlaybackSpeed === speed ? '#555' : 'transparent' }]}>
                      <Text style={styles.trackText}>{speed === 1 ? 'Normal' : `${speed}x`}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
          </View>
        
          <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.applyButton} onPress={onApply}>
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flexDirection: 'row',
    backgroundColor: '#303134',
    width: '90%',
    height: '80%',
    borderRadius: 10,
    padding: 10,
    paddingBottom: 20
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'vestas-sans-medium',
    marginBottom: 10,
  },
  tracksContainer: {
    maxHeight: '80%',
    marginBottom: 20,
  },
  trackItem: {
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  trackText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'vestas-sans-book',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    position: 'absolute',
    bottom: 20,
    right: 20
  },
  applyButton: {
    backgroundColor: '#4BA6F7',
    borderRadius: 50,
    padding: 8,
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#555',
    padding: 8,
    borderRadius: 50,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'vestas-sans-medium',
    textAlign: 'center',
  },
});

export default AudioSubsModal;
