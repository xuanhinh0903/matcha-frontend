import { useCallback } from 'react';
import { socket } from '../utils/socket';
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

export function useOfferSending(
  peerConnection: RTCPeerConnection,
  roomName: string
) {
  const sendOffer = useCallback(async () => {
    try {
      // Prevent crash: do not set local description if peerConnection is closed or null
      if (!peerConnection || peerConnection.signalingState === 'closed') {
        console.warn(
          'PeerConnection is closed or null, skipping setLocalDescription'
        );
        return;
      }
      console.log('Creating and sending offer...');
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      // Ensure we properly set the local description with guaranteed sdp
      if (!offer.sdp) {
        console.error('Failed to create offer: SDP is undefined');
        return;
      }

      await peerConnection.setLocalDescription(
        new RTCSessionDescription({
          type: offer.type,
          sdp: offer.sdp,
        })
      );

      // Wait a brief moment to ensure the description is set
      await new Promise((resolve) => setTimeout(resolve, 100));

      socket.emit('send_connection_offer', {
        roomName,
        offer,
      });
      console.log('Offer sent successfully');
    } catch (error) {
      console.error('Error creating or sending offer:', error);
    }
  }, [roomName, peerConnection]);

  return { sendOffer };
}
