import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { safeEmit } from '../utils/socket';
import { RTCPeerConnection, MediaStream } from 'react-native-webrtc';

export function usePeerConnection(localStream: MediaStream, roomName: string) {
  const [guestStream, setGuestStream] = useState<MediaStream | null>(null);
  // Add a new state to track connection status
  const [connectionStatus, setConnectionStatus] = useState<
    'new' | 'connecting' | 'connected' | 'failed' | 'closed'
  >('new');
  // Track which track IDs have already been added to prevent duplicate additions
  const addedTrackIds = useRef(new Set<string>());
  // Track whether negotiation is needed
  const negotiationNeeded = useRef(false);
  // Keep track of remote tracks
  const remoteStreams = useRef<MediaStream[]>([]);

  // Create wrapper function to safely handle ICE candidates
  const safelySendIceCandidate = useCallback(
    (candidate: RTCIceCandidate) => {
      if (!candidate) return;

      safeEmit('send_candidate', { candidate, roomName });
    },
    [roomName]
  );

  const peerConnection = useMemo(() => {
    // Create RTCPeerConnection with improved configuration
    const connection = new RTCPeerConnection({
      iceServers: [
        // Google STUN servers (more reliable)
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },

        {
          urls: 'stun:stun.relay.metered.ca:80',
        },
        {
          urls: 'turn:standard.relay.metered.ca:80',
          username: '1af8491bd13353e9efc2864e',
          credential: 'jm4SJ8bjAnZmInkj',
        },
        {
          urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
          username: '1af8491bd13353e9efc2864e',
          credential: 'jm4SJ8bjAnZmInkj',
        },
        {
          urls: 'turn:standard.relay.metered.ca:443',
          username: '1af8491bd13353e9efc2864e',
          credential: 'jm4SJ8bjAnZmInkj',
        },
        {
          urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
          username: '1af8491bd13353e9efc2864e',
          credential: 'jm4SJ8bjAnZmInkj',
        },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
      iceTransportPolicy: 'all',
      // Removed sdpSemantics as it's not supported in the current TypeScript definitions
    });

    // Reset the track IDs set when creating a new connection
    addedTrackIds.current.clear();
    remoteStreams.current = [];
    setConnectionStatus('new');

    // Use try-catch blocks for all event handlers to avoid runtime errors
    try {
      // Add ICE candidate handler with error handling
      connection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          console.log(
            'ICE candidate found:',
            event.candidate.candidate.substring(0, 50) + '...'
          );
          safelySendIceCandidate(event.candidate as RTCIceCandidate);
        }
      });

      // Add ICE gathering state change handler to monitor progress
      connection.addEventListener('icegatheringstatechange', () => {
        console.log(`ICE gathering state: ${connection.iceGatheringState}`);
      });

      // Add connection state change handler for better mobile reliability
      connection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state: ${connection.connectionState}`);
        // Update connection status based on the connection state
        setConnectionStatus(connection.connectionState as any);

        if (connection.connectionState === 'failed') {
          console.warn('Connection failed, attempting reconnection...');
          try {
            connection.restartIce();
          } catch (error) {
            console.warn('Error restarting ICE:', error);
          }
        }
      });

      // Improved track handler with more robust handling
      connection.addEventListener('track', (event) => {
        try {
          console.log('Track received:', event.track!.kind, event.track!.id);

          // Make sure the track is enabled immediately
          if (!event.track!.enabled) {
            event.track!.enabled = true;
            console.log(`Enabling received ${event.track!.kind} track`);
          }

          // Create a new MediaStream if none exists or use the first one from the event
          let mediaStream: MediaStream;
          if (event.streams && event.streams.length > 0) {
            mediaStream = event.streams[0];
            console.log('Using provided stream:', mediaStream.id);
          } else {
            // No stream was provided, create a new one
            mediaStream = new MediaStream();
            mediaStream.addTrack(event.track!);
            console.log('Created new stream with track:', mediaStream.id);

            // Add the track to the connection to make sure it's associated with the stream
            try {
              connection.addTrack(event.track!, mediaStream);
            } catch (err) {
              console.warn('Error adding track to connection (ignored):', err);
            }
          }

          // Debug information about all tracks in the stream
          console.log(`Media stream ${mediaStream.id} tracks:`);
          mediaStream.getTracks().forEach((track) => {
            console.log(
              `- ${track.kind} track ${track.id}, enabled: ${track.enabled}`
            );
            // Make sure all tracks are enabled
            if (!track.enabled) {
              track.enabled = true;
              console.log(`  Enabled ${track.kind} track that was disabled`);
            }
          });

          // Keep track of streams we've seen
          if (!remoteStreams.current.some((s) => s.id === mediaStream.id)) {
            remoteStreams.current.push(mediaStream);
          }
          console.log(`Remote streams count: ${remoteStreams.current.length}`);
          // Set the guest stream to display
          setGuestStream(mediaStream);
        } catch (error) {
          console.warn('Error handling remote track:', error);
        }
      });

      // Listen for negotiation needed events
      connection.addEventListener('negotiationneeded', () => {
        console.log('Negotiation needed event fired');
        negotiationNeeded.current = true;
      });

      // Add ice connection state change handler
      connection.addEventListener('iceconnectionstatechange', () => {
        console.log(`ICE connection state: ${connection.iceConnectionState}`);
        // For older browsers that don't support connectionstatechange
        if (
          connection.iceConnectionState === 'connected' ||
          connection.iceConnectionState === 'completed'
        ) {
          setConnectionStatus('connected');
        } else if (connection.iceConnectionState === 'failed') {
          setConnectionStatus('failed');
          try {
            connection.restartIce();
          } catch (err) {
            console.warn('Error during ICE restart:', err);
          }
        }
      });
    } catch (error) {
      console.error('Error setting up peer connection event handlers:', error);
    }

    return connection;
  }, [roomName, safelySendIceCandidate]);

  // Add reset function
  const resetConnection = useCallback(() => {
    try {
      console.log('Performing complete peer connection reset...');

      // close the RTCPeerConnection
      if (peerConnection && peerConnection.signalingState !== 'closed') {
        // First remove all event listeners to prevent memory leaks
        try {
          // Use type assertion to avoid TypeScript errors
          const pc = peerConnection as any;
          pc.onicecandidate = null;
          pc.ontrack = null;
          pc.onnegotiationneeded = null;
          pc.oniceconnectionstatechange = null;
          pc.onicegatheringstatechange = null;
          pc.onsignalingstatechange = null;
          pc.onconnectionstatechange = null;
        } catch (e) {
          console.warn('Error removing event listeners:', e);
        }

        // Close all transceivers if supported
        try {
          if (peerConnection.getTransceivers) {
            const transceivers = peerConnection.getTransceivers();
            transceivers.forEach((transceiver) => {
              try {
                transceiver.stop();
              } catch (err) {
                console.warn('Error stopping transceiver:', err);
              }
            });
          }
        } catch (e) {
          console.warn('Error stopping transceivers:', e);
        }

        // Stop all tracks from senders
        try {
          const senders = peerConnection.getSenders();
          senders.forEach((sender: any) => {
            if (sender.track) {
              sender.track.stop();
            }

            try {
              peerConnection.removeTrack(sender);
            } catch (err) {
              console.warn('Error removing track from peer connection:', err);
            }
          });
        } catch (e) {
          console.warn('Error stopping sender tracks:', e);
        }

        // Close the connection
        peerConnection.close();
      }

      // stop all local tracks
      if (localStream) {
        localStream.getTracks().forEach((t) => {
          t.stop();
          localStream.removeTrack(t);
        });
      }

      // stop all remote tracks
      remoteStreams.current.forEach((stream) => {
        if (stream) {
          stream.getTracks().forEach((t) => {
            t.stop();
            stream.removeTrack(t);
          });
        }
      });

      // clear refs & state
      addedTrackIds.current.clear();
      remoteStreams.current = [];
      negotiationNeeded.current = false;
      setGuestStream(null);
      setConnectionStatus('new');

      console.log('PeerConnection reset complete');
    } catch (e) {
      console.warn('Error during connection reset:', e);
    }
  }, [peerConnection, localStream]);

  // Add local tracks to peer connection
  useEffect(() => {
    const addTracks = async () => {
      if (!localStream) return;

      try {
        // Add each track one by one with error handling
        for (const track of localStream.getTracks()) {
          try {
            // Only add the track if it hasn't been added before
            if (!addedTrackIds.current.has(track.id)) {
              peerConnection.addTrack(track, localStream);
              addedTrackIds.current.add(track.id);
              console.log(`Added track: ${track.kind} (${track.id})`);
            } else {
              console.log(
                `Track already exists: ${track.kind} (${track.id}), skipping`
              );
            }
          } catch (err) {
            console.warn(
              `Error adding track to peer connection: ${track.kind} (${track.id})`,
              err
            );
          }
        }
      } catch (error) {
        console.warn('Error adding tracks to peer connection:', error);
      }
    };

    addTracks();

    // Cleanup function to properly handle unmounting
    return () => {
      try {
        // Close all senders to prevent memory leaks
        const senders = peerConnection.getSenders();
        for (const sender of senders) {
          if (sender.track) {
            sender.track.stop();
          }
        }

        // Clear any pending ice candidates
        try {
          // @ts-ignore - Force clean internal buffers that may cause Chrome extension errors
          if (peerConnection._iceGatherer) {
            // @ts-ignore
            peerConnection._iceGatherer.onlocalcandidate = null;
          }
        } catch (err) {
          // Ignore errors on internal properties
        }
      } catch (error) {
        console.warn('Error during peer connection cleanup:', error);
      }
    };
  }, [localStream, peerConnection]);

  return {
    peerConnection,
    guestStream,
    connectionStatus,
    resetConnection,
  };
}
