import React, { Component } from 'react';

import { createStore, combineReducers, compose } from 'redux';
import { Provider } from 'react-redux';

import { reduxComponentStateStore } from 'redux-component-state';

import appInfo from '../reducers/appInfo';

import CounterPanel from './CounterPanel';

const combinedReducers = combineReducers({ appInfo });

let createFinalStore = compose(
    reduxComponentStateStore,
    createStore
    );

const store = createFinalStore(combinedReducers);


export default class App extends Component {

  render() {
    return (
      <Provider store={store}>
        {() => <CounterPanel />}
      </Provider>
    );
  }
}

