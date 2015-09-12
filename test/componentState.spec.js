require('babel/polyfill');

import test from 'tape';

import reduxComponentState from '../src';
// import { createStore, combineReducers, compose } from 'redux';
// import { addTodo } from './helpers/actionCreators';
// import * as reducers from './helpers/reducers';

const space = '  ';

test('reduxComponentState', ({end}) => end() );
test(`.${space}should be a function`, ({ok, equal, end}) => {
  ok(reduxComponentState, 'should exists');
  equal(typeof reduxComponentState, 'function');

  end();
});
