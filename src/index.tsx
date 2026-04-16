import React from 'react';
import ReactDOM from 'react-dom';
// import * as serviceWorker from './serviceWorker';
import './css/index.css';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import App from './App';
import { configureStore, history } from './store/configureStore';
(window as any).__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

const store = configureStore();
ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path="/" component={App} />
    </ConnectedRouter>
  </Provider>, document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
