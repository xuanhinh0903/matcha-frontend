import { type Router } from 'expo-router';

export type TResponse<T> = {
  data: T;
  message: string;
};

export type TScreenProp = {
  router: Router;
};

export interface IAction<T = any> {
  payload: T;
  type: string;
}

export type TItem = {
  id: number;
  name: string;
};
