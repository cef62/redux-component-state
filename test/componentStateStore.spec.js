import test from 'tape';

import { createStore, combineReducers, compose } from 'redux';
import { reduxComponentStateStore } from '../src';
import { addTodo } from './helpers/actionCreators';
import * as reducers from './helpers/reducers';

const space = '  ';
const setup = () => {
  // create redux store
  const createFinalStore = compose(reduxComponentStateStore)(createStore);
  const store = createFinalStore(combineReducers(reducers));

  // create redux reducer for component state
  const reducer = combineReducers({ todos: reducers.todos });

  // setup subscription API test variables
  const subscribe = store.componentState.subscribe;
  const minimalConfig = {
    key: '',
    reducer,
  };
  const completeConfig = Object.assign({}, minimalConfig, {
    initialState: {
      todos: [{
        id: 999,
        text: 're-hydratated todo',
      }],
    },
  });
  return {store, reducer, subscribe, minimalConfig, completeConfig};
};


test('reduxComponentStateStore', ({end}) => end() );

test(`.${space}should be a function`, ({ok, equal, end}) => {
  ok(reduxComponentStateStore, 'should exists');
  equal(typeof reduxComponentStateStore, 'function');
  end();
});

test(`.${space}should expose the public API`, ({equal, end}) => {
  const { store } = setup();
  const methods = Object.keys(store);

  equal(methods.length, 5);
  ['subscribe', 'dispatch', 'getState', 'replaceReducer']
    .forEach( key => equal(typeof store[key], 'function', `API missing: ${key}`) );

  equal(typeof store.componentState, 'object', `API missing: componentState`);
  equal(typeof store.componentState.subscribe, 'function', `API missing: componentState.subscribe`);

  end();
});

test(`.${space}should require a valid configuration object`, ({throws, doesNotThrow, end}) => {
  const { subscribe, minimalConfig, completeConfig } = setup();
  throws( subscribe );
  throws( () => subscribe({}) );
  throws( () => subscribe({a: 33, b: 'temp'}) );

  minimalConfig.key = 'keyA';
  doesNotThrow( () => subscribe(minimalConfig) );
  throws( () => subscribe(minimalConfig) );

  completeConfig.key = 'keyB';
  doesNotThrow( () => subscribe(completeConfig) );

  Reflect.deleteProperty(completeConfig.initialState, 'todos');
  throws( () => subscribe(completeConfig) );

  end();
});

test(`.${space}componentState.subscribe()`, ({end}) => end() );

test(`.${space}${space}should return a subscription object`, ({ok, equal, end}) => {
  const { subscribe, minimalConfig } = setup();
  minimalConfig.key = 'keyA';
  const subscription = subscribe(minimalConfig);

  ok( subscription );
  equal( typeof subscription, 'object' );

  end();
});

test(`.${space}${space}returned object should expose the public API`, ({ok, equal, end}) => {
  const { subscribe, minimalConfig } = setup();
  minimalConfig.key = 'keyA';
  const subscription = subscribe(minimalConfig);

  const api = Object.keys(subscription);
  equal( api.length, 4 );

  ok( subscription.unsubscribe );
  ok( subscription.dispatch );
  ok( subscription.getState );
  ok( subscription.storeKey );

  equal( typeof subscription.unsubscribe, 'function' );
  equal( typeof subscription.dispatch, 'function' );
  equal( typeof subscription.getState, 'function' );
  equal( typeof subscription.storeKey, 'string' );

  end();
});

test(`.${space}${space}should create a new store with name ending with the given subscription key`, ({ok, end}) => {
  const { store, subscribe, minimalConfig } = setup();
  const key = 'keyA';
  minimalConfig.key = key;
  const subscription = subscribe(minimalConfig);

  const match = Object.keys(store.getState()).find( k => k.endsWith(key) );
  ok( match );

  const state = store.getState()[subscription.storeKey];
  ok( Array.isArray(state.todos) );

  end();
});

test(`.${space}${space}should create a new store populated with given initial state`, ({equal, end}) => {
  const { subscribe, completeConfig } = setup();
  completeConfig.key = 'keyA';
  const subscription = subscribe(completeConfig);

  const todos = subscription.getState().todos;
  equal( todos.length, 1 );
  equal( todos[0].id, completeConfig.initialState.todos[0].id );
  equal( todos[0].text, completeConfig.initialState.todos[0].text );

  end();
});

test(`.${space}componentState.unsubscribe()`, ({end}) => end() );

test(`.${space}${space}should remove the component store from redux`, ({notOk, end}) => {
  const { store, subscribe, minimalConfig } = setup();
  const key = 'keyA';
  minimalConfig.key = key;
  const subscription = subscribe(minimalConfig);
  subscription.unsubscribe();
  const match = Object.keys(store.getState()).find( k => k.endsWith(key) );
  notOk( match );
  end();
});


test(`.${space}componentState.dispatch()`, ({end}) => end() );

test(`.${space}${space}should update the state assigned to the component`, ({equal, end}) => {
  const { store, subscribe, minimalConfig } = setup();
  minimalConfig.key = 'keyA';
  const subscription = subscribe(minimalConfig);
  subscription.dispatch(addTodo('new todo'));

  let todos = subscription.getState().todos;
  equal( todos.length, 1 );
  equal( todos[0].text, 'new todo' );

  todos = store.getState()[subscription.storeKey].todos;
  equal( todos.length, 1 );
  equal( todos[0].text, 'new todo' );

  end();
});

test(`.${space}${space}should throw if invoked after unsubscription`, ({throws, end}) => {
  const { subscribe, minimalConfig } = setup();
  minimalConfig.key = 'keyA';
  const subscription = subscribe(minimalConfig);
  const action = () => subscription.dispatch(addTodo('new todo'));
  action();
  subscription.unsubscribe();
  throws( action );

  end();
});

test(`.${space}componentState.getState()`, ({end}) => end() );

test(`.${space}${space}should throw if invoked after unsubscription`, ({throws, ok, end}) => {
  const { subscribe, minimalConfig } = setup();
  minimalConfig.key = 'keyA';
  const subscription = subscribe(minimalConfig);

  const state = subscription.getState();
  ok( state );
  ok( Array.isArray(state.todos) );

  subscription.unsubscribe();
  throws( subscription.getState );

  end();
});
