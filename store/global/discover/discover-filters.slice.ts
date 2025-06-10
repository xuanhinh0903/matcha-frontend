import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface DiscoverFiltersState {
  filterInterests: number[];
}

const initialState: DiscoverFiltersState = {
  filterInterests: [],
};

export const discoverFiltersSlice = createSlice({
  name: 'discoverFilters',
  initialState,
  reducers: {
    setFilterInterests: (state, action: PayloadAction<number[]>) => {
      state.filterInterests = action.payload;
    },
    clearFilterInterests: (state) => {
      state.filterInterests = [];
    },
  },
});

export const { setFilterInterests, clearFilterInterests } =
  discoverFiltersSlice.actions;

// Selector to get filter interests
export const getFilterInterests = (state: RootState) =>
  state.discoverFilters.filterInterests;

export default discoverFiltersSlice.reducer;
