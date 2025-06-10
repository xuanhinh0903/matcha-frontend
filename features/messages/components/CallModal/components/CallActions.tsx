import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { CallStatus } from '../types';
import { callEvents } from '../../../utils/eventEmitter';

interface CallActionsProps {
  callStatus: CallStatus;
  isOutgoing: boolean;
  pulseStyle: any; // Animated style object
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  handleEndCall: () => void;
  isVideoCall?: boolean;
  conversationId?: string;
  // Audio control props
  isMuted: boolean;
  isSpeaker: boolean;
  toggleMute: () => void;
  toggleSpeaker: () => void;
}

export const CallActions: React.FC<CallActionsProps> = ({
  callStatus,
  isOutgoing,
  pulseStyle,
  onAccept,
  onReject,
  onEnd,
  handleEndCall,
  isVideoCall = false,
  conversationId,
  // Audio controls
  isMuted,
  isSpeaker,
  toggleMute,
  toggleSpeaker,
}) => {
  // Handle accepting, rejecting and ending calls
  const handleAcceptCall = async () => {
    try {
      await onAccept();
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleRejectCall = async () => {
    try {
      // Play the sound first
      await handleEndCall();

      // After sound plays, make sure to close the modal
      // Wait a short time for the sound to start playing before closing
      setTimeout(() => {
        onReject();
      }, 300);
    } catch (error) {
      // console.error('Error rejecting call:', error);
      // If there's an error, still try to close the modal
      onReject();
    }
  };

  const handleEndCallButton = async () => {
    try {
      await handleEndCall();

      // Emit event to refresh messages if needed
      if (conversationId) {
        const eventName = `call_end_${conversationId}`;
        console.log(`Emitting event: ${eventName}`);
        callEvents.emit(eventName);
      }

      onEnd();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  // Different actions depending on call status
  const renderActions = () => {
    // For active calls, show end call button and additional controls
    if (callStatus === 'connected') {
      return (
        <View style={styles.controlsContainer}>
          {/* Additional controls for active calls */}
          <View style={styles.extraControls}>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.activeControl]}
              onPress={toggleMute}
            >
              <FontAwesome
                name={isMuted ? 'microphone-slash' : 'microphone'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isSpeaker && styles.activeControl]}
              onPress={toggleSpeaker}
            >
              <FontAwesome
                name={isSpeaker ? 'volume-up' : 'volume-down'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* End call button */}
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndCallButton}
          >
            <FontAwesome name="phone" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    // For ended calls, show a message
    if (callStatus === 'ended') {
      return (
        <View style={styles.endedContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onEnd}>
            <FontAwesome name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    // For incoming calls, show accept and reject buttons
    if (!isOutgoing) {
      return (
        <View style={styles.incomingContainer}>
          {/* Reject button */}
          <Animated.View style={[styles.rejectButtonContainer, pulseStyle]}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleRejectCall}
            >
              <FontAwesome name="phone" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          {/* Accept button */}
          <Animated.View style={[styles.acceptButtonContainer, pulseStyle]}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptCall}
            >
              <FontAwesome name="phone" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }

    // For outgoing calls, show only end call button
    return (
      <View style={styles.outgoingContainer}>
        <TouchableOpacity style={styles.endButton} onPress={handleRejectCall}>
          <FontAwesome name="phone" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return <View style={styles.container}>{renderActions()}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  incomingContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  outgoingContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonContainer: {
    padding: 5,
  },
  acceptButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  rejectButtonContainer: {
    padding: 5,
  },
  rejectButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '225deg' }],
  },
  endButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '225deg' }],
    alignSelf: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
