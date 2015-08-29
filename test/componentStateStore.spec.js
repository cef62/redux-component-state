import { expect, use } from 'chai';
// import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createStore, combineReducers, compose } from 'redux';
import { reduxComponentStateStore } from '../src';
import { addTodo } from './helpers/actionCreators';
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

  describe('componentState.subscribe()', () => {
    let subscribe;
    let minimalConfig;
    let completeConfig;
    let reducer;

    beforeEach('create redux reducer for component state', () => {
      reducer = combineReducers({ todos: reducers.todos });
    });

    beforeEach('setup subscription API test variables', () => {
      subscribe = store.componentState.subscribe;
      minimalConfig = {
        key: '',
        reducer,
      };
      completeConfig = Object.assign({}, minimalConfig, {
        initialState: {
          todos: [{
            id: 999,
            text: 're-hydratated todo',
          }],
        },
      });
    });

    it('should require a valid configuration object', () => {
      expect( () => subscribe() ).to.throw(Error);
      expect( () => subscribe({}) ).to.throw(Error);
      expect( () => subscribe({a: 33, b: 'temp'}) ).to.throw(Error);
      minimalConfig.key = 'keyA';
      expect( () => subscribe(minimalConfig) ).to.not.throw(Error);
      expect( () => subscribe(minimalConfig) ).to.throw(Error);
      completeConfig.key = 'keyB';
      expect( () => subscribe(completeConfig) ).to.not.throw(Error);
      Reflect.deleteProperty(completeConfig.initialState, 'todos');
      expect( () => subscribe(completeConfig) ).to.throw(Error);
    });

    it('should return a subscription object', () => {
      minimalConfig.key = 'keyA';
      const subscription = subscribe(minimalConfig);

      expect( subscription ).to.exist;
      expect( subscription ).to.be.an('object');
    });

    it('should return a subscription object, and it should expose the public API', () => {
      minimalConfig.key = 'keyA';
      const subscription = subscribe(minimalConfig);

      const api = Object.keys(subscription);

      expect( api ).to.have.length(4);
      expect( subscription ).to.include.keys('unsubscribe');
      expect( subscription ).to.include.keys('dispatch');
      expect( subscription ).to.include.keys('getState');
      expect( subscription ).to.include.keys('storeKey');

      expect( subscription.unsubscribe ).to.be.a('function');
      expect( subscription.dispatch ).to.be.a('function');
      expect( subscription.getState ).to.be.a('function');
      expect( subscription.storeKey ).to.be.a('string');
    });

    it('should create a new store with name ending with the given subscription key', () => {
      const key = 'keyA';
      minimalConfig.key = key;
      const subscription = subscribe(minimalConfig);

      const match = Object.keys(store.getState()).find( k => k.endsWith(key) );
      expect( match ).to.exist;

      const state = store.getState()[subscription.storeKey];
      expect( state ).to.exist;
      expect( state.todos ).to.be.an('array');
    });

    it('should create a new store populated with given initial state', () => {
      completeConfig.key = 'keyA';
      const subscription = subscribe(completeConfig);

      const todos = subscription.getState().todos;
      expect( todos ).to.have.length(1);
      expect( todos[0].id ).to.equal(completeConfig.initialState.todos[0].id);
      expect( todos[0].text ).to.equal(completeConfig.initialState.todos[0].text);
    });

    describe('.unsubscribe()', () => {
      it('should remove the component store from redux after unsubscribe is invoked', () => {
        const key = 'keyA';
        minimalConfig.key = key;
        const subscription = subscribe(minimalConfig);
        subscription.unsubscribe();
        const match = Object.keys(store.getState()).find( k => k.endsWith(key) );
        expect( match ).to.not.exist;
      });
    });

    describe('.dispatch()', () => {
      it('should update the component specific state', () => {
        const key = 'keyA';
        minimalConfig.key = key;
        const subscription = subscribe(minimalConfig);
        subscription.dispatch(addTodo('new todo'));

        let todos = subscription.getState().todos;
        expect( todos ).to.have.length(1);
        expect( todos[0].text ).to.equal('new todo');

        todos = store.getState()[subscription.storeKey].todos;
        expect( todos ).to.have.length(1);
        expect( todos[0].text ).to.equal('new todo');
      });

      it('should throw if invoked after unsubscription', () => {
        const key = 'keyA';
        minimalConfig.key = key;
        const subscription = subscribe(minimalConfig);
        const action = () => subscription.dispatch(addTodo('new todo'));
        action();

        subscription.unsubscribe();
        expect( action ).to.throw(Error);
      });
    });

    describe('.getState()', () => {
      it('should throw if invoked after unsubscription', () => {
        const key = 'keyA';
        minimalConfig.key = key;
        const subscription = subscribe(minimalConfig);

        const state = subscription.getState();
        expect( state ).to.exist;
        expect( state.todos ).to.be.an('array');

        subscription.unsubscribe();
        expect( subscription.getState ).to.throw(Error);
      });
    });
  });
});
