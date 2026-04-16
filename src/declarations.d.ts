declare module 'connected-react-router' {
  import { Middleware, Reducer } from 'redux';
  import { History } from 'history';
  import * as React from 'react';

  export function connectRouter(history: History): (reducer: Reducer) => Reducer;
  export function routerMiddleware(history: History): Middleware;
  export function push(path: string): any;

  interface ConnectedRouterProps {
    history: History;
    children?: React.ReactNode;
  }
  export class ConnectedRouter extends React.Component<ConnectedRouterProps> {}
}
