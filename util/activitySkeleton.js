import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const inprogressSkeletonLoader = () => {
  return (
    <SkeletonPlaceholder>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.cell, styles.cellLeft]}>
            <View style={styles.skeletonText} />
          </View>
          <View style={[styles.cell, styles.cellRight]}>
            <View style={styles.skeletonText} />
          </View>
        </View>
        <View style={styles.separatorContainer}>
          <View style={styles.leftSeparator} />
          <View style={styles.rightSeparator} />
        </View>
        <View style={styles.row}>
          <View style={[styles.cell, styles.cellLeft]}>
            <View style={styles.skeletonText} />
          </View>
          <View style={[styles.cell, styles.cellRight]}>
            <View style={styles.skeletonText} />
          </View>
        </View>
        <View style={styles.concentricCircle}>
          <View style={styles.progressCircle}>
            <View style={styles.skeletonText} />
          </View>
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    margin: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cell: {
    flex: 1,
    padding: 8,
  },
  cellLeft: {
    alignItems: 'flex-start',
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  separatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  leftSeparator: {
    height: 1,
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  rightSeparator: {
    height: 1,
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  concentricCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonText: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});



