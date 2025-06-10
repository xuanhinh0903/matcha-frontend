// mediaUtils.tsx - Utilities for WebRTC media track management
import { MediaStream, MediaStreamTrack } from 'react-native-webrtc';

/**
 * Updates track settings (enable/disable) for audio and video
 *
 * @param stream The media stream to update
 * @param settings Settings object with video and audio enabled flags
 */
export const updateTrackSettings = (
  stream: MediaStream | null,
  settings: { video: boolean; audio: boolean }
): void => {
  if (!stream) return;

  try {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = settings.video;
    });

    stream.getAudioTracks().forEach((track) => {
      track.enabled = settings.audio;
    });
  } catch (err) {
    console.warn('Error updating track settings:', err);
  }
};

/**
 * Stops all tracks in a MediaStream and cleans up resources
 *
 * @param stream The media stream to cleanup
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
  if (!stream) return;

  try {
    stream.getTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });
  } catch (err) {
    console.warn('Error stopping media stream:', err);
  }
};

/**
 * Apply bandwidth constraints to video tracks based on quality setting
 *
 * @param track The video track to update
 * @param quality The quality level to set ('low', 'medium', 'high')
 */
export const applyVideoConstraints = async (
  track: MediaStreamTrack,
  quality: 'low' | 'medium' | 'high'
): Promise<void> => {
  try {
    let constraints = {};

    switch (quality) {
      case 'low':
        constraints = {
          width: { ideal: 320, max: 480 },
          height: { ideal: 240, max: 360 },
          frameRate: { ideal: 15, max: 20 },
        };
        break;
      case 'high':
        constraints = {
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 30, max: 30 },
        };
        break;
      case 'medium':
      default:
        constraints = {
          width: { ideal: 640, max: 640 },
          height: { ideal: 480, max: 480 },
          frameRate: { ideal: 24, max: 24 },
        };
        break;
    }

    await track.applyConstraints(constraints);
    console.log(`Applied ${quality} quality constraints to video track`);
  } catch (err) {
    console.warn('Error applying video constraints:', err);
  }
};

/**
 * Clean up resources in an RTCPeerConnection
 *
 * @param peerConnection The RTCPeerConnection to clean up
 * @param localStream The local media stream
 * @param remoteStreams Array of remote streams
 */
export const cleanupPeerConnection = (
  peerConnection: any,
  localStream: MediaStream | null,
  remoteStreams: MediaStream[] | null
): void => {
  try {
    // Close data channels first
    if (peerConnection) {
      const senders = peerConnection.getSenders();
      senders.forEach((sender: any) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      // Close the connection
      peerConnection.close();
    }

    // Stop all local media tracks
    if (localStream) {
      stopMediaStream(localStream);
    }

    // Stop all remote streams
    if (remoteStreams) {
      remoteStreams.forEach((stream) => {
        stopMediaStream(stream);
      });
    }
  } catch (err) {
    console.warn('Error during connection cleanup:', err);
  }
};

/**
 * Monitor track statistics to detect and report potential issues
 *
 * @param peerConnection The RTCPeerConnection to monitor
 * @param callback Optional callback to receive statistics
 * @returns Cleanup function to stop monitoring
 */
export const monitorConnectionStats = (
  peerConnection: any,
  callback?: (stats: any) => void
): (() => void) => {
  if (!peerConnection) return () => {};

  let isStopped = false;

  const getStats = async () => {
    if (isStopped || !peerConnection) return;

    try {
      const stats = await peerConnection.getStats();
      const statsArray = [];

      // Process all stats
      stats.forEach((stat: any) => {
        if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
          statsArray.push({
            type: 'video-in',
            packetsReceived: stat.packetsReceived,
            packetsLost: stat.packetsLost,
            jitter: stat.jitter,
            frameWidth: stat.frameWidth,
            frameHeight: stat.frameHeight,
            framesPerSecond: stat.framesPerSecond,
          });
        } else if (stat.type === 'outbound-rtp' && stat.kind === 'video') {
          statsArray.push({
            type: 'video-out',
            packetsSent: stat.packetsSent,
            retransmittedPacketsSent: stat.retransmittedPacketsSent,
            frameWidth: stat.frameWidth,
            frameHeight: stat.frameHeight,
            framesPerSecond: stat.framesPerSecond,
          });
        } else if (stat.type === 'candidate-pair' && stat.nominated) {
          // This is the current active connection
          statsArray.push({
            type: 'connection',
            rtt: stat.currentRoundTripTime,
            availableOutgoingBitrate: stat.availableOutgoingBitrate,
            priority: stat.priority,
          });
        }
      });

      // Check for high packet loss, jitter, or other issues
      const videoInStats = statsArray.find((s) => s.type === 'video-in');
      if (videoInStats && videoInStats.packetsLost > 50) {
        console.warn('High packet loss detected:', videoInStats.packetsLost);
      }

      if (callback) {
        callback(statsArray);
      }
    } catch (err) {
      console.warn('Error getting connection stats:', err);
    }

    // Schedule next stats check
    if (!isStopped) {
      setTimeout(getStats, 5000); // Check every 5 seconds
    }
  };

  // Start monitoring
  getStats();

  // Return cleanup function
  return () => {
    isStopped = true;
  };
};
