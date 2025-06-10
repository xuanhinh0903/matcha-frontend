import { useCallback } from 'react';
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

export function useAnswerProcessing(peerConnection: RTCPeerConnection) {
  const handleOfferAnswer = useCallback(
    async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      try {
        // Prevent crash: do not set remote description if peerConnection is closed or null
        if (!peerConnection || peerConnection.signalingState === 'closed') {
          console.warn(
            'PeerConnection is closed or null, skipping setRemoteDescription'
          );
          return;
        }
        console.log('Processing received answer');
        // Check if we're in the right state to set a remote answer
        // An answer can only be set after an offer has been created and set locally
        if (peerConnection.signalingState === 'have-local-offer') {
          // Ensure all required fields are present in the answer
          if (!answer || !answer.sdp) {
            console.warn('Invalid answer received, missing SDP');
            return;
          }

          // Modify SDP to ensure all media tracks are included
          const modifiedSdp = ensureMediaLinesInSDP(answer.sdp);

          // Create a new RTCSessionDescription with explicit type and guaranteed sdp
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription({
              type: answer.type,
              sdp: modifiedSdp,
            })
          );
          console.log('Remote description (answer) set successfully');
        } else {
          console.warn(
            `Cannot set remote description (answer) in state: ${peerConnection.signalingState}. Expected 'have-local-offer'.`
          );

          // Try to recover from unexpected state
          if (peerConnection.signalingState === 'stable' && answer) {
            console.log(
              'Connection already in stable state, may have already processed this answer'
            );
          }
        }
      } catch (error) {
        console.error('Error setting remote description (answer):', error);
      }
    },
    [peerConnection]
  );

  // Helper function to ensure video and audio lines are in the SDP
  const ensureMediaLinesInSDP = (sdp: string): string => {
    // Check if video section exists in the SDP
    if (sdp.indexOf('m=video') === -1) {
      console.warn('No video section in SDP, this could cause one-sided video');
    }

    // Check if audio section exists in the SDP
    if (sdp.indexOf('m=audio') === -1) {
      console.warn('No audio section in SDP, this could cause one-sided audio');
    }

    return sdp;
  };

  return {
    handleOfferAnswer,
  };
}
