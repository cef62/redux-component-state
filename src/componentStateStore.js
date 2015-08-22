import combineReducers from 'redux/lib/utils/combineReducers';
import {
  LOCAL,
  LOCAL_INIT,
  LOCAL_MOUNT,
  LOCAL_UNMOUNT,
  LOCAL_ACTION,
  LOCAL_KEY
} from './actionTypes';

import invariant from 'invariant';

export default function createComponentStateStore(next) {
  // map of component state subscribers
  let subscribersMap = {};

  // redux store
  let store;

  // ****************************************************************
  // getState method,
  // the state is sliced with only the specific component state of
  // the subscriber
  // ****************************************************************

  function getStateKey({key}) {
    // key = (typeof key === 'string') ? key : key.key;
    return LOCAL_KEY + key;
  }

  function getState(key) {
    let stateKey = getStateKey({key});
    return store.getState()[stateKey];
  }

  // ****************************************************************
  // unsubscribe method,
  // passed upon the subscription
  // ****************************************************************

  function unsubscribe(key, onChange) {
    // if no more subscriber are available, clear the temporary store
    if (subscribersMap[key].subscribers.length === 1) {
      // unmount the component store
      store.dispatch({ type: LOCAL, subType: LOCAL_UNMOUNT, key });
      // clear subscriber data
      delete subscribersMap[key];
      return;
    }

    // remove unsubscriber from subscriber map
    subscribersMap[key].subscribers = subscribersMap[key].subscribers.filter((fn) => fn !== onChange);
  }

  // ****************************************************************
  // subscribe method,
  // passed to children via `store context`
  // ****************************************************************

  function subscribe({ key, reducers, onChange, shared, initialState }) {
    // TODO: add default values and error management
    // target stored state manager object
    let stateManager = subscribersMap[key];

    invariant( !(stateManager && !shared),
        `Illegal Operation - ComponentState HoS for key: ${key} is not shareable!
        Try to set 'shared' field in the store configuration.`
        );

    // init component state for given key
    if (!stateManager) {
      stateManager = subscribersMap[key] = {
        reducersObj: {},
        subscribers: [],
        reducer: null
      };
    }

    // add subscriber listener to the list
    stateManager.subscribers.push(onChange);
    // merge existent reducers with the new received in a map of available
    // reducers
    stateManager.reducersObj = { ...stateManager.reducersObj, ...reducers };
    // create redux reducer function
    stateManager.reducer = combineReducers(stateManager.reducersObj);

    // if the subsribed component state is new, mount it on the redux store
    if (!getState(key)) {
      store.dispatch({ type: LOCAL, subType: LOCAL_MOUNT, state: initialState, key });
    }

    // return unsuscriber function
    return unsubscribe.bind(null, key, onChange);
  }

  // ****************************************************************
  // Reducer wrapper function,
  // use internally to create a component state reducer
  // ****************************************************************

  /*
   * Component State Action Signature:
   * {
   *  key: {required} {string},
   *  type: {required} {string},
   *  subType: {required} {string},
   *  state: {optional} {object} pre-composed state to map to the component
   *          state, used to component state mounting,
   *  data: {required for subtype === LOCAL_ACTION } original action submitted
   * }
   */
  const reactions = {
    [LOCAL_MOUNT]: (state, action, reducer) => {
      state[getStateKey(action)] = action.state || reducer(undefined, { type: LOCAL_INIT });
      return state;
    },

    [LOCAL_UNMOUNT]: (state, action) => {
      delete state[getStateKey(action)];
      return state;
    },

    [LOCAL_ACTION]: (state, action, reducer) => {
      state[getStateKey(action)] = reducer(state[getStateKey(action)], action.data);
      return state;
    }
  };

  function componentStateReducer(reducer) {
    // `reducer` is the received original redux store reducer function
    // return reducer method signature
    return (state, action) => {
      // create temporary state to be processed by specific component state
      // reducers
      let tmpState = {
        [getStateKey(action)]: (state || {})[getStateKey(action)] || {}
      };

      // process action with the original reducer
      const newState = reducer(state, action);

      // TODO: move the component state reducer to its own function?
      // test if the action received is bound to a component state
      if (action.type === LOCAL && subscribersMap[ action.key ]) {
        // react properly to component state actions
        let reaction = reactions[action.subType] || ( (currentState) => currentState );
        reaction(tmpState, action, subscribersMap[action.key].reducer);

        // wait the completion of current stack trace before notify the
        // subscriber. Required to permit completion of current execution stack
        setTimeout(function notifySubscriber() {
          if (subscribersMap[action.key]) {
            subscribersMap[action.key].subscribers.forEach((fn) => fn());
          }
        });
      }
      if (tmpState[getStateKey(action)]) {
        newState[getStateKey(action)] = tmpState[getStateKey(action)];
      }
      return newState;
    };
  }

  // ****************************************************************
  // returned Higher Order Store Creator function
  // ****************************************************************

  return function componentStateStore(reducer, initialState) {
    // keep reference to the redux store
    store = next(componentStateReducer(reducer), initialState);

    // return composed store.
    // The replaceReducer is wrapped to use the component store implementation.
    // A `componentState` field is added to the main redux store.
    return {
      ...store,
      replaceReducer: (reducerFunc) => store.replaceReducer(componentStateReducer(reducerFunc)),
      componentState: {
        subscribe,
        unsubscribe,
        getState
      }
    };
  };
}
