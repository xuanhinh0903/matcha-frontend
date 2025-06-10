import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

// Define the call state structure
export interface CallState {
  activeCallId: string | null;
  callStatus: 'initiating' | 'ringing' | 'connected' | 'ended' | null;
  isOutgoing: boolean;
  otherUserId: number | null;
  otherUserName: string | null;
  otherUserAvatar: string | null;
  callType: 'audio' | 'video';
  callDuration: number;
  callScreenMounted: boolean;
  refetchMessages?: () => Promise<void>;
  activeCallRegistry: Record<string, boolean>;
  recentlyEndedCalls: Record<string, number>;
}

const initialState: CallState = {
  activeCallId: null,
  callStatus: null,
  isOutgoing: false,
  otherUserId: null,
  otherUserName: null,
  otherUserAvatar: null,
  callType: 'audio',
  callDuration: 0,
  callScreenMounted: false,
  refetchMessages: undefined,
  activeCallRegistry: {},
  recentlyEndedCalls: {},
};

export const callsSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    // Start or receive a new call
    initiateCall: (
      state,
      action: PayloadAction<{
        callId: string;
        isOutgoing: boolean;
        userId: number;
        userName: string;
        userAvatar?: string;
        callType?: 'audio' | 'video';
        refetchMessages?: () => Promise<void>;
      }>
    ) => {
      const {
        callId,
        isOutgoing,
        userId,
        userName,
        userAvatar,
        callType,
        refetchMessages,
      } = action.payload;

      // Only allow a new call if we don't have an active one
      if (
        state.activeCallId &&
        state.callStatus !== 'ended' &&
        state.callStatus !== null
      ) {
        console.log(
          `[Call Store] Ignoring new call ${callId} - already in call ${state.activeCallId}`
        );
        return;
      }

      console.log(
        `[Call Store] Initiating call: ${callId}, isOutgoing: ${isOutgoing}`
      );

      state.activeCallId = callId;
      state.callStatus = isOutgoing ? 'initiating' : 'ringing';
      state.isOutgoing = isOutgoing;
      state.otherUserId = userId;
      state.otherUserName = userName;
      state.otherUserAvatar = userAvatar || 'https://picsum.photos/200';
      state.callType = callType || 'audio';
      state.callDuration = 0;
      state.refetchMessages = refetchMessages;
    },

    // Set call status (connected, ended, etc.)
    setCallStatus: (
      state,
      action: PayloadAction<
        'initiating' | 'ringing' | 'connected' | 'ended' | null
      >
    ) => {
      console.log(
        `[Call Store] Setting call status: ${action.payload} for call ${state.activeCallId}`
      );
      state.callStatus = action.payload;

      // Reset call duration when the call connects
      if (action.payload === 'connected') {
        state.callDuration = 0;
      }
    },

    // Increment call duration
    incrementCallDuration: (state) => {
      if (state.callStatus === 'connected') {
        state.callDuration += 1;
      }
    },

    // End the active call
    endCall: (state) => {
      console.log(`[Call Store] Ending call: ${state.activeCallId}`);
      state.callStatus = 'ended';
    },

    // Reset call state completely
    resetCall: (state) => {
      console.log(
        `[Call Store] Resetting call state from ${state.activeCallId}`
      );
      return {
        ...initialState,
        activeCallRegistry: state.activeCallRegistry,
        recentlyEndedCalls: state.recentlyEndedCalls,
      };
    },

    // Track when call screen is mounted to prevent duplication
    setCallScreenMounted: (state, action: PayloadAction<boolean>) => {
      console.log(
        `[Call Store] Setting callScreenMounted to ${action.payload}`
      );
      state.callScreenMounted = action.payload;
    },

    // New reducers for call registry functionality
    registerActiveCall: (state, action: PayloadAction<string>) => {
      const callId = action.payload;

      if (!callId) return;

      // Make sure the activeCallRegistry exists
      if (!state.activeCallRegistry) {
        state.activeCallRegistry = {};
      }

      // Only register if not already active
      if (!state.activeCallRegistry[callId]) {
        state.activeCallRegistry[callId] = true;

        // Make sure recentlyEndedCalls exists
        if (!state.recentlyEndedCalls) {
          state.recentlyEndedCalls = {};
        }

        // Remove from recently ended if present
        if (state.recentlyEndedCalls[callId]) {
          delete state.recentlyEndedCalls[callId];
        }

        console.log(
          `[Call Registry] Registered active call: ${callId}`,
          JSON.stringify(state.activeCallRegistry)
        );
      } else {
        console.log(
          `[Call Registry] Call ${callId} already registered, skipping`
        );
      }
    },

    unregisterActiveCall: (state, action: PayloadAction<string>) => {
      const callId = action.payload;

      if (!callId) return;

      // Make sure the activeCallRegistry exists
      if (!state.activeCallRegistry) {
        state.activeCallRegistry = {};
        console.log(
          `[Call Registry] Created activeCallRegistry because it was undefined`
        );
      }

      if (state.activeCallRegistry[callId]) {
        delete state.activeCallRegistry[callId];

        // Make sure recentlyEndedCalls exists
        if (!state.recentlyEndedCalls) {
          state.recentlyEndedCalls = {};
        }

        // Mark this call as recently ended to prevent immediate callbacks
        state.recentlyEndedCalls[callId] = Date.now();

        console.log(
          `[Call Registry] Unregistered call: ${callId}`,
          JSON.stringify(state.activeCallRegistry)
        );
      } else {
        console.log(
          `[Call Registry] Attempted to unregister non-existent call: ${callId}`
        );
      }
    },

    // Clean up a specific ended call after timeout
    cleanupEndedCall: (state, action: PayloadAction<string>) => {
      const callId = action.payload;

      // Make sure recentlyEndedCalls exists
      if (!state.recentlyEndedCalls) {
        state.recentlyEndedCalls = {};
        return;
      }

      if (state.recentlyEndedCalls[callId]) {
        delete state.recentlyEndedCalls[callId];
        console.log(`[Call Registry] Cleaned up ended call: ${callId}`);
      }
    },

    // Reset registry (for debugging/testing)
    resetCallRegistry: (state) => {
      console.log('[Call Registry] RESETTING REGISTRY');
      state.activeCallRegistry = {};
      state.recentlyEndedCalls = {};
    },

    // New action to clear a specific call from recently ended calls
    clearRecentlyEndedCall: (state, action: PayloadAction<string>) => {
      const callId = action.payload;

      if (!state.recentlyEndedCalls) {
        state.recentlyEndedCalls = {};
        return;
      }

      if (state.recentlyEndedCalls[callId]) {
        delete state.recentlyEndedCalls[callId];
        console.log(
          `[Call Registry] Manually cleared call ${callId} from recently ended calls`
        );
      }
    },
  },
});

// Export actions
export const callsActions = callsSlice.actions;

// Export reducer
export const callsReducer = callsSlice.reducer;

// Selectors
export const getActiveCallId = (state: RootState): string | null =>
  state.calls.activeCallId;
export const getCallStatus = (state: RootState) => state.calls.callStatus;
export const getCallDetails = (state: RootState) => state.calls;
export const isCallScreenMounted = (state: RootState): boolean =>
  state.calls.callScreenMounted;

// Selectors for call registry
export const isCallActive = (state: RootState, callId: string): boolean => {
  if (!callId) return false;

  // Check if call is active
  const isActive = !!state.calls.activeCallRegistry[callId];

  // For debugging, log the result with more context
  console.log(
    `[Call Registry] isCallActive check for ${callId}: ${
      isActive ? 'ACTIVE' : 'NOT ACTIVE'
    }`
  );

  // Also check if this call was recently ended to prevent auto-callbacks
  const endedTimestamp = state.calls.recentlyEndedCalls[callId];
  if (endedTimestamp) {
    const now = Date.now();
    const timeSinceEnd = now - endedTimestamp;

    // If call was ended less than 5 seconds ago, consider it "still ending" to prevent bounce-back
    if (timeSinceEnd < 5000) {
      console.log(
        `[Call Registry] Call ${callId} was recently ended (${timeSinceEnd}ms ago). Blocking new attempt.`
      );
      return true;
    }
  }

  return isActive;
};
