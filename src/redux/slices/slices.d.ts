import { AuthSlice } from "./auth";

export type ActionKeys<T> = keyof typeof T;

export type ActionKey<T> = `dispatch${Capitalize<T>}Action`;

export type DispatchesRecord<T> = Record<ActionKey<T>, (params: any) => void>;

export type useAuthActions = () => DispatchesRecord<
  keyof typeof AuthSlice.actions
>;
