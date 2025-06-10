import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

// Define the WebSocket state structure
export interface WebSocketState {
  socketStatus:
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error'
    | 'replaced';
  socketId: string | null;
}

const initialState: WebSocketState = {
  socketStatus: 'disconnected',
  socketId: null,
};

export const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setSocketStatus: (
      state,
      action: PayloadAction<
        'connecting' | 'connected' | 'disconnected' | 'error' | 'replaced'
      >
    ) => {
      state.socketStatus = action.payload;
    },

    setSocketId: (state, action: PayloadAction<string | null>) => {
      state.socketId = action.payload;
    },

    resetSocketState: (state) => {
      return initialState;
    },
  },
});

// Export actions
export const websocketActions = websocketSlice.actions;

// Export reducer
export const websocketReducer = websocketSlice.reducer;

// Selectors
export const getSocketStatus = (state: RootState) =>
  state.websocket.socketStatus;
export const getSocketId = (state: RootState) => state.websocket.socketId;
export const isWebSocketConnected = (state: RootState) =>
  state.websocket.socketStatus === 'connected';
