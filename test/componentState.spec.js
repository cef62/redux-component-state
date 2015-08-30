import test from 'tape';

import reduxComponentState from '../src';
import { createStore, combineReducers, compose } from 'redux';
// import { addTodo } from './helpers/actionCreators';
import * as reducers from './helpers/reducers';

const space = '  ';
const setup = () => {
  // create redux store
  const createFinalStore = compose( reduxComponentStateStore, createStore);
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

test('reduxComponentState', ({end}) => end() );
test(`.${space}should be a function`, ({ok, equal, end}) => {
  ok(reduxComponentState, 'should exists');
  equal(typeof reduxComponentState, 'function');

  end();
});
