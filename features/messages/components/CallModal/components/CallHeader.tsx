import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CallStatus } from '../types';

interface CallHeaderProps {
  callStatus: CallStatus;
  formattedDuration: string;
  isVideoCall?: boolean;
}

export const CallHeader: React.FC<CallHeaderProps> = ({
  callStatus,
  formattedDuration,
  isVideoCall = false,
}) => {
  const shouldShowDuration = callStatus === 'connected';

  return (
    <View
      style={[
        styles.headerContainer,
        isVideoCall && callStatus === 'connected' && styles.videoCallHeader,
      ]}
    >
      {shouldShowDuration && (
        <>
          <View style={styles.liveIndicator} />
          <Text style={styles.durationText}>{formattedDuration}</Text>
          {isVideoCall && <Text style={styles.videoText}>Video Call</Text>}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  videoCallHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 4,
    marginRight: 8,
  },
  durationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    opacity: 0.8,
  },
});
