import { useCallback } from 'react';
import { socket } from '../utils/socket';
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

export function useSendingAnswer(
  peerConnection: RTCPeerConnection,
  roomName: string
) {
  const handleConnectionOffer = useCallback(
    async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      try {
        // Prevent crash: do not set remote description if peerConnection is closed or null
        if (!peerConnection || peerConnection.signalingState === 'closed') {
          console.warn(
            'PeerConnection is closed or null, skipping setRemoteDescription'
          );
          return;
        }

        // Only set the remote offer if we're in a state where we can do so
        if (peerConnection.signalingState === 'stable') {
          // Ensure sdp is defined before creating RTCSessionDescription
          if (!offer.sdp) {
            console.warn('Invalid offer received, missing SDP');
            return;
          }

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription({
              type: offer.type,
              sdp: offer.sdp,
            })
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit('answer', { answer, roomName });
        } else {
          console.warn(
            `Cannot set remote offer in state: ${peerConnection.signalingState}. Expected 'stable'.`
          );
        }
      } catch (error) {
        console.error('Error handling connection offer:', error);
      }
    },
    [roomName, peerConnection]
  );

  return {
    handleConnectionOffer,
  };
}
