import { io } from 'socket.io-client';

// Create socket instance with optimized configuration for WebRTC
export const socket = io(`${process.env.EXPO_PUBLIC_API_URL}calls`, {
  autoConnect: false,
  reconnectionAttempts: 10, // Increased from 5 to 10 for better reliability
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
  timeout: 10000, // Increased timeout for poor connections
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  forceNew: true,
  query: {
    clientVersion: '1.0', // Usefpul for tracking client versions
    deviceType: 'mobile', // Helps with server-side debugging
  },
});
export const messageSocket = io(`${process.env.EXPO_PUBLIC_API_URL}messages`, {
  autoConnect: false,
  reconnectionAttempts: 10, // Increased from 5 to 10 for better reliability
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
  timeout: 10000, // Increased timeout for poor connections
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  forceNew: true,
  query: {
    clientVersion: '1.0', // Usefpul for tracking client versions
    deviceType: 'mobile', // Helps with server-side debugging
  },
});
// Buffer for messages that fail to send during connection issues
const messageBuffer: any = [];
let isReconnecting = false;

// Enhanced connection management
socket.io.on('reconnect_attempt', (attempt) => {
  console.log(`[Socket] Reconnection attempt ${attempt}`);
  isReconnecting = true;
});

socket.io.on('reconnect', () => {
  console.log(
    '[Socket] Reconnected successfully, processing buffered messages'
  );
  isReconnecting = false;

  // Process any buffered messages after reconnection
  while (messageBuffer.length > 0) {
    const { event, data, callback } = messageBuffer.shift();
    socket.emit(event, data, callback);
    console.log(`[Socket] Sent buffered message: ${event}`);
  }
});

socket.io.on('reconnect_failed', () => {
  console.warn('[Socket] Failed to reconnect after all attempts');
  messageBuffer.length = 0; // Clear buffer to avoid memory leaks
});

// Add global error handlers to catch and handle socket errors
socket.on('connect_error', (error) => {
  console.warn('[Socket] Connection error:', error.message);
});

socket.on('error', (error) => {
  console.warn('[Socket] Error:', error);
});

// Monitor connection and disconnection events
socket.on('connect', () => {
  console.log('[Socket] Connected successfully');
  isReconnecting = false;
});

// Handle forced disconnect from server (especially after leave_room)
socket.on('forced_disconnect', (data) => {
  console.log('[Socket] Server requested forced disconnect:', data);

  // Disconnect the socket
  socket.disconnect();

  // If we should reconnect automatically after disconnection
  if (data.shouldReconnect) {
    console.log('[Socket] Will reconnect after forced disconnect');
    // Short timeout to ensure proper disconnect before reconnect
    setTimeout(() => {
      socket.connect();
    }, 500);
  }
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);

  // Handle different disconnect reasons differently
  if (reason === 'io server disconnect') {
    // Server initiated disconnect, reconnect manually
    socket.connect();
  }
  // For other reasons, socket.io will try to reconnect automatically
});

// Utility function to safely emit messages with buffering during disconnections
export const safeEmit = (event: string, data: any, callback?: Function) => {
  try {
    if (!socket.connected || isReconnecting) {
      // Buffer the message if socket is disconnected
      console.log(`[Socket] Buffering message ${event} while disconnected`);
      messageBuffer.push({ event, data, callback });

      // If socket is disconnected, try to reconnect
      if (!socket.connected && !isReconnecting) {
        console.log('[Socket] Attempting to reconnect...');
        socket.connect();
      }

      return;
    }

    if (callback) {
      socket.emit(event, data, (...args: any[]) => {
        try {
          callback(...args);
        } catch (err) {
          console.warn(`[Socket] Callback error for ${event}:`, err);
        }
      });
    } else {
      socket.emit(event, data);
    }

    console.log(`[Socket] Emitted: ${event}`);
  } catch (err) {
    console.warn(`[Socket] Error emitting ${event}:`, err);

    // Buffer the message on error
    messageBuffer.push({ event, data, callback });
  }
};

// Initialize socket connection
export const initializeSocket = () => {
  if (socket.disconnected) {
    console.log('[Socket] Initializing connection');
    socket.connect();
  }

  return socket;
};

// Properly disconnect socket
export const disconnectSocket = () => {
  console.log('[Socket] Disconnecting socket');
  messageBuffer.length = 0; // Clear any buffered messages
  socket.disconnect();
};
