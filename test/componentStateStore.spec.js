import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createStore, combineReducers, compose } from 'redux';
import { reduxComponentStateStore } from '../src';
import { addTodo, dispatchInMiddle, throwError } from './helpers/actionCreators';
import * as reducers from './helpers/reducers';

use(sinonChai);

describe('reduxComponentStateStore', () => {
  let createFinalStore;
  let store;

  beforeEach('create redux store', () => {
    createFinalStore = compose( reduxComponentStateStore, createStore);
    store = createFinalStore(combineReducers(reducers));
  });

  it('should expose the public API', () => {
    const methods = Object.keys(store);

    expect(methods).to.have.length(6);
    expect(store).to.include.keys('subscribe');
    expect(store).to.include.keys('dispatch');
    expect(store).to.include.keys('getState');
    expect(store).to.include.keys('getReducer');
    expect(store).to.include.keys('replaceReducer');
    expect(store).to.include.keys('componentState');
    expect(store.componentState).to.include.keys('subscribe');
  });

  describe('componentState.subscribe', () => {
    let subscribe;
    let minimalConfig;
    let completeConfig;

    beforeEach('setup subscription API test variables', () => {
      subscribe = store.componentState.subscribe;
      minimalConfig = {
        key: '',
        reducers: {
          todos: reducers.todos
        }
      };
      completeConfig = Object.assign({}, minimalConfig, {
        initialState: {
          todos: {}
        }
      });
    });

    it('should require a valid configuration object', () => {
      expect( () => subscribe() ).to.throw(Error);
      expect( () => subscribe({}) ).to.throw(Error);
      expect( () => subscribe({a:33, b: 'temp'}) ).to.throw(Error);
      minimalConfig.key = 'keyA';
      expect( () => subscribe(minimalConfig) ).to.not.throw(Error);
      expect( () => subscribe(minimalConfig) ).to.throw(Error);
      completeConfig.key = 'keyB';
      expect( () => subscribe(completeConfig) ).to.not.throw(Error);
      Reflect.deleteProperty(completeConfig.initialState, 'todos');
      expect( () => subscribe(completeConfig) ).to.throw(Error);
    });

    it('should return a subscription object', () => {
      // test an object is returned
      // test storedKey, dispatch and subscribe are available on returned object
      // test storeKey ends with given key
      // test unsubscribe is a function
      // test unsubscribe remove the component specific reducer from the main store
      // test unsubscribe is called on the component store
      // test dispatch is a function
      // test dispatch correctly update the component store using its specific reducer
      // test dispatch should throw if invoked for a non-existent component state
    });
  });
});
