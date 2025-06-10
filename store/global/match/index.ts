import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

export interface MatchedUser {
  name: string;
  image: string;
  conversationId?: string;
}

interface MatchState {
  isVisible: boolean;
  currentUserImage: string;
  matchedUser: MatchedUser | null;
}

const initialState: MatchState = {
  isVisible: false,
  currentUserImage: '',
  matchedUser: null,
};

export const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    showMatchPopup: (
      state,
      action: PayloadAction<{
        currentUserImage: string;
        matchedUser: MatchedUser;
      }>
    ) => {
      state.isVisible = true;
      state.currentUserImage = action.payload.currentUserImage;
      state.matchedUser = action.payload.matchedUser;
    },
    hideMatchPopup: (state) => {
      state.isVisible = false;
    },
  },
});

export const { showMatchPopup, hideMatchPopup } = matchSlice.actions;

export const selectMatchState = (state: RootState) => state.match;

export default matchSlice.reducer;
