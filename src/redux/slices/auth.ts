import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { string } from "yup";

export interface AuthState {
  user?: {};
}

const initialState: AuthState = {
  user: null,
};

export const AuthSlice = createSlice({
  name: "AuthSlice",
  initialState,
  reducers: {
    setUser: (state, payload) => {
      state.user = payload;
    },
  },
});

/**
 * @type {import('./slices').useAuthActions}
 */
export const useAuthActions = () => {
  const actions = Object.keys(AuthSlice.actions);
  const dispatch = useDispatch();

  const _ = actions.reduce((prev, curr, i) => {
    const fnName = `dispatch${curr[0].toUpperCase()}${curr.slice(1)}`;
    const fnValue = (params) => {
      dispatch(AuthSlice.actions[curr](params));
    };
    prev[fnName] = fnValue;
    return prev;
  }, {});
  return _;
};

const _initialState = AuthSlice.getInitialState();
/**
 *
 * @returns {_initialState}
 */
export const useSelectorAuth = () =>
  useSelector((state) => state[AuthSlice.name]);

export default AuthSlice.reducer;
