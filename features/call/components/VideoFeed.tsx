// VideoFeed.tsx
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';

function VideoFeed({
  stream,
  isMuted = false,
  isLocal = false,
  isRemote = false,
  userName = '',
  avatar,
  isVideoEnabled = true,
  isFullscreen = false,
  style,
}: any) {
  const [streamURL, setStreamURL] = useState<string | null>(null);

  useEffect(() => {
    if (stream && stream.toURL) {
      try {
        // Generate stream URL for RTCView
        const url = stream.toURL();

        // Debug audio and video tracks
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        console.log(
          `VideoFeed: ${isRemote ? 'REMOTE' : 'LOCAL'} stream has ${
            audioTracks.length
          } audio tracks and ${videoTracks.length} video tracks`
        );
        console.log(
          `VideoFeed: Stream URL: ${url}, isMuted=${isMuted}, isVideoEnabled=${isVideoEnabled}`
        );

        // Enable all video tracks for remote streams
        videoTracks.forEach((track: any) => {
          // For remote tracks, we want them always enabled unless specifically disabled
          if (isRemote && !track.enabled) {
            console.log('VideoFeed: Enabling disabled remote video track');
            track.enabled = true;
          }
        });

        // Handle audio tracks properly
        audioTracks.forEach((track: any) => {
          if (isRemote) {
            // Remote audio should be enabled unless explicitly muted by the user
            const shouldBeEnabled = !isMuted;
            if (track.enabled !== shouldBeEnabled) {
              console.log(
                `VideoFeed: Setting remote audio track enabled=${shouldBeEnabled}`
              );
              track.enabled = shouldBeEnabled;
            }
          } else if (isLocal) {
            // Local audio is controlled by the mic mute button elsewhere
            console.log(
              `VideoFeed: Local audio track enabled=${track.enabled}`
            );
          }
        });

        setStreamURL(url);
      } catch (err) {
        console.error('Error processing stream in VideoFeed:', err);
        setStreamURL(null);
      }
    } else {
      setStreamURL(null);
    }
  }, [stream, isMuted, isLocal, isRemote, isVideoEnabled]);

  // Handle when we actually have a stream to show
  if (!stream) {
    return (
      <View style={[styles.container, style, styles.disabled]}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{userName.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.name}>{userName}</Text>
        </View>
      </View>
    );
  }

  // When we have a stream but video is disabled
  if (!isVideoEnabled) {
    return (
      <View style={[styles.container, style, styles.disabled]}>
        {/* Keep audio playing even when video is disabled */}
        {streamURL && (
          <RTCView
            streamURL={streamURL}
            style={styles.hiddenVideo}
            objectFit="cover"
            mirror={isLocal}
            zOrder={-1}
          />
        )}
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{userName.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.name}>{userName}</Text>
        </View>
      </View>
    );
  }

  // Regular video display when we have both stream and video enabled
  return (
    <View style={[styles.container, style]}>
      {streamURL ? (
        <RTCView
          streamURL={streamURL}
          style={[styles.video, isFullscreen && styles.fullscreen]}
          objectFit="cover"
          mirror={isLocal}
          zOrder={1}
        />
      ) : (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}
    </View>
  );
}
export default React.memo(VideoFeed);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hiddenVideo: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  fullscreen: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  disabled: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c0c0c',
  },
  avatarContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#85b06a',
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4a6b38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 36,
  },
  name: {
    marginTop: 8,
    color: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});
