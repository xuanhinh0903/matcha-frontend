import { WritableDraft } from "immer";
import { type IAction } from "../../../types";
import { type TAuthInitialState, authInitialState } from "./auth.slice";

export type IAuthAction = TAuthInitialState;

export const authReducer = {
  setAuthProfile: (
    state: WritableDraft<TAuthInitialState>,
    action: IAction<IAuthAction>
  ) => {
    const { payload } = action;
    if (!payload) {
      return;
    }

    if (payload.user) {
      state.user = payload.user;
    }
    if (payload.token) {
      state.token = payload.token;
    }
  },
  clear: (state: WritableDraft<TAuthInitialState>) => {
    state.token = null;
    state.user = null;
  },
  logout: (state: WritableDraft<TAuthInitialState>) => {
    state.token = null;
    state.user = null;
  },
};
