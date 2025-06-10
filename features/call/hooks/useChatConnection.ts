import { useCallback, useEffect, useRef } from 'react';
import { RTCIceCandidate, RTCPeerConnection } from 'react-native-webrtc';
import { safeEmit, socket } from '../utils/socket';
import { useAnswerProcessing } from './useAnswerProcessing';
import { useOfferSending } from './useOfferSending';
import { useSendingAnswer } from './useSendingAnswer';

export function useChatConnection(
  peerConnection: RTCPeerConnection,
  roomName: string
) {
  // Buffer for storing ice candidates that arrive before remote description is set
  const iceCandidatesBuffer = useRef<RTCIceCandidate[]>([]);
  // Track if remote description has been set
  const hasRemoteDescription = useRef(false);
  // Track if component is mounted
  const isMounted = useRef(true);
  // Track reconnection attempts
  const reconnectAttempts = useRef(0);
  // Max reconnection attempts
  const MAX_RECONNECT_ATTEMPTS = 5;
  // Add a ref to track if both users have joined
  const otherUserJoined = useRef(false);

  const { sendOffer } = useOfferSending(peerConnection, roomName);

  const { handleConnectionOffer } = useSendingAnswer(peerConnection, roomName);

  const { handleOfferAnswer } = useAnswerProcessing(peerConnection);

  // Function to safely process any buffered ICE candidates
  const processIceCandidates = useCallback(() => {
    if (!isMounted.current) return;

    // Check if we have remote description and candidates to process
    if (
      hasRemoteDescription.current &&
      iceCandidatesBuffer.current.length > 0
    ) {
      console.log(
        `Processing ${iceCandidatesBuffer.current.length} buffered ICE candidates`
      );

      // Clone the buffer and then clear it to avoid potential race conditions
      const candidatesToProcess = [...iceCandidatesBuffer.current];
      iceCandidatesBuffer.current = [];

      // Process each candidate with individual error handling
      for (const candidate of candidatesToProcess) {
        setTimeout(() => {
          if (isMounted.current && peerConnection.remoteDescription) {
            try {
              peerConnection.addIceCandidate(candidate).catch((err) => {
                console.warn(
                  'Error adding buffered ICE candidate (ignored):',
                  err
                );
              });
            } catch (err) {
              console.warn('Exception processing ICE candidate:', err);
            }
          } else if (isMounted.current) {
            console.log(
              'Remote description not available for buffered candidate, re-buffering'
            );
            iceCandidatesBuffer.current.push(candidate);
            // Schedule a retry with exponential backoff
            setTimeout(processIceCandidates, 1000);
          }
        }, 0);
      }
    }
  }, [peerConnection]);

  // Handle joining the room and connection setup
  const handleConnection = useCallback(() => {
    if (!isMounted.current) return;

    console.log(`Joining room: ${roomName}`);
    safeEmit('join_room', roomName);

    try {
      // Force the connection state to "connecting" if it's new
      // This helps with some devices where the state doesn't update properly
      // @ts-ignore - Access internal property to update connection state
      if (peerConnection.connectionState === 'new') {
        // @ts-ignore
        peerConnection._connectionState = 'connecting';
        // Use type assertion to bypass TypeScript error
        const pc = peerConnection as unknown as {
          onconnectionstatechange?: (event: any) => void;
          addEventListener?: (event: string, handler: () => void) => void;
        };

        // Try both approaches for maximum compatibility
        if (pc.onconnectionstatechange) {
          pc.onconnectionstatechange({} as any);
        } else if (pc.addEventListener) {
          // Try using event listener if available
          pc.addEventListener('connectionstatechange', () => {});
        } else {
          // Fallback - at least we updated the internal state above
          console.log(
            'No method available to notify about connection state change'
          );
        }
      }
    } catch (err) {
      console.log('Could not force connection state update:', err);
    }

    // Make sure audio tracks are enabled when connecting
    if (peerConnection) {
      const audioSenders = peerConnection
        .getSenders()
        .filter((sender) => sender.track && sender.track.kind === 'audio');

      audioSenders.forEach((sender) => {
        if (sender.track && !sender.track.enabled) {
          console.log(
            `Enabling audio track before connection: ${sender.track.id}`
          );
          sender.track.enabled = true;
        }
      });
    }
  }, [peerConnection, roomName]);

  const handleReceiveCandidate = useCallback(
    ({ candidate }: { candidate: RTCIceCandidate }) => {
      if (!isMounted.current || !candidate) return;

      // If remote description isn't set yet or isn't properly defined, buffer the candidate
      if (!hasRemoteDescription.current || !peerConnection.remoteDescription) {
        console.log('Buffering ICE candidate until remote description is set');
        iceCandidatesBuffer.current.push(candidate);
      } else {
        // Otherwise add it immediately with error handling in a timeout to avoid extension conflicts
        setTimeout(() => {
          if (isMounted.current) {
            // Double-check that remote description is still set (it might have changed)
            if (peerConnection.remoteDescription) {
              peerConnection.addIceCandidate(candidate).catch((err) => {
                console.warn(
                  'Error adding ICE candidate, buffering instead:',
                  err
                );
                iceCandidatesBuffer.current.push(candidate);
                // Schedule a retry with exponential backoff
                setTimeout(processIceCandidates, 500);
              });
            } else {
              console.log(
                'Remote description no longer set, buffering candidate'
              );
              iceCandidatesBuffer.current.push(candidate);
            }
          }
        }, 0);
      }
    },
    [peerConnection, processIceCandidates]
  );

  // Update wrapper for handleConnectionOffer that marks remote description as set
  const wrappedHandleConnectionOffer = useCallback(
    async (data: { offer: RTCSessionDescriptionInit }) => {
      if (!isMounted.current) return;

      try {
        await handleConnectionOffer(data);
        hasRemoteDescription.current = true;
        processIceCandidates();
      } catch (err) {
        console.warn('Error in connection offer:', err);
        // Try to recover by clearing the signaling state if possible
        try {
          if (peerConnection.signalingState !== 'stable') {
            await peerConnection.setLocalDescription({
              type: 'rollback',
              sdp: '',
            });
          }
        } catch (rollbackErr) {
          console.warn('Rollback failed:', rollbackErr);
        }
      }
    },
    [handleConnectionOffer, processIceCandidates, peerConnection]
  );

  // Update wrapper for handleOfferAnswer that marks remote description as set
  const wrappedHandleOfferAnswer = useCallback(
    async (data: { answer: RTCSessionDescriptionInit }) => {
      if (!isMounted.current) return;

      try {
        await handleOfferAnswer(data);
        hasRemoteDescription.current = true;
        processIceCandidates();
      } catch (err) {
        console.warn('Error in offer answer:', err);
      }
    },
    [handleOfferAnswer, processIceCandidates]
  );

  // Handle socket reconnections
  const handleReconnect = useCallback(() => {
    if (!isMounted.current) return;

    reconnectAttempts.current += 1;
    console.log(`Socket reconnected, attempt #${reconnectAttempts.current}`);

    if (reconnectAttempts.current <= MAX_RECONNECT_ATTEMPTS) {
      // Rejoin the room
      handleConnection();
    }
  }, [handleConnection]);

  // Handle peer disconnected event (when the other user ends the call)
  const handlePeerDisconnected = useCallback(
    (data: { callId: string }) => {
      if (!isMounted.current) return;

      // Only proceed if this is for our room/callId
      if (data.callId === roomName) {
        console.log(
          'Received peer_disconnected event, other user ended the call'
        );

        // Close the peer connection
        try {
          if (peerConnection && peerConnection.signalingState !== 'closed') {
            peerConnection.close();
          }
        } catch (err) {
          console.warn(
            'Error closing peer connection after peer disconnected:',
            err
          );
        }
      }
    },
    [peerConnection, roomName]
  );

  // Handle when another person is ready to peer
  const handleAnotherPersonReady = useCallback(() => {
    if (!isMounted.current) return;
    console.log('Another person joined the room, sending offer');
    otherUserJoined.current = true;

    // Make sure all audio tracks are enabled before sending offer
    try {
      if (peerConnection) {
        const audioSenders = peerConnection
          .getSenders()
          .filter((sender) => sender.track && sender.track.kind === 'audio');

        audioSenders.forEach((sender) => {
          if (sender.track && !sender.track.enabled) {
            console.log(
              `Enabling audio track before sending offer: ${sender.track.id}`
            );
            sender.track.enabled = true;
          }
        });
      }
    } catch (err) {
      console.warn('Error ensuring audio tracks are enabled:', err);
    }

    // Send offer to the other user
    sendOffer();
  }, [sendOffer, peerConnection]);

  useEffect(() => {
    // Mark component as mounted immediately to prevent any further callbacks
    isMounted.current = true;

    // Set up socket event listeners with error handling
    socket.on('answer', wrappedHandleOfferAnswer);
    socket.on('send_connection_offer', wrappedHandleConnectionOffer);
    socket.on('another_person_ready', handleAnotherPersonReady);
    socket.on('connect', handleConnection);
    socket.on('reconnect', handleReconnect);
    socket.on('send_candidate', handleReceiveCandidate);
    socket.on('peer_disconnected', handlePeerDisconnected);

    // Call handleConnection to join the room immediately
    handleConnection();

    // Clean up on unmount
    return () => {
      // Mark component as unmounted immediately to prevent any further callbacks
      isMounted.current = false;

      console.log('Cleaning up all socket event listeners...');

      // Clean up all socket listeners
      socket.off('answer', wrappedHandleOfferAnswer);
      socket.off('send_connection_offer', wrappedHandleConnectionOffer);
      socket.off('another_person_ready', handleAnotherPersonReady);
      socket.off('connect', handleConnection);
      socket.off('reconnect', handleReconnect);
      socket.off('send_candidate', handleReceiveCandidate);
      socket.off('peer_disconnected', handlePeerDisconnected);

      // Clear any buffered ICE candidates
      iceCandidatesBuffer.current = [];

      // Leave the room to ensure clean state for next calls
      try {
        socket.emit('leave_room', roomName);
        console.log(`Left room: ${roomName}`);
      } catch (err) {
        console.warn('Error leaving room:', err);
      }
    };
  }, [
    wrappedHandleOfferAnswer,
    wrappedHandleConnectionOffer,
    handleAnotherPersonReady,
    handleConnection,
    handleReconnect,
    handleReceiveCandidate,
    handlePeerDisconnected,
    roomName,
  ]);
}
