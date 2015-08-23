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

  // get random alphanumeric string
  function randomUid(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)))
      .toString(36)
      .slice(1);
  }

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

  function unsubscribe(key, uid) {
    // if no more subscriber are available, clear the temporary store
    if (subscribersMap[key].subscribers.length === 1) {
      // unmount the component store
      store.dispatch({ type: LOCAL, subType: LOCAL_UNMOUNT, key });
      // clear subscriber data
      delete subscribersMap[key];
      return;
    }

    // remove unsubscriber from subscriber map
    subscribersMap[key].subscribers = subscribersMap[key]
      .subscribers
      .filter((fn) => fn !== uid);
  }

  // ****************************************************************
  // subscribe method,
  // passed to children via `store context`
  // ****************************************************************

  function subscribe({ key, reducers, shared, initialState }) {
    // compose unique store-key
    let storeKey = getStateKey({key});

    // target stored state manager object
    let stateManager = subscribersMap[storeKey];

    // invariant not correct, shared should be stored and confrented from first
    // creation!!!
    invariant( !(stateManager && !shared),
        `Illegal Operation - ComponentState HoS for key: ${key} is not shareable!
        Try to set 'shared' field in the store configuration.`
        );

    // init component state for given key
    if (!stateManager) {
      stateManager = subscribersMap[storeKey] = {
        reducersObj: {},
        subscribers: [],
        reducer: null
      };
    }

    // create random uid for subscriber
    let uid = randomUid(36);

    // add subscriber listener to the list
    stateManager.subscribers.push(uid);

    // merge existent reducers with the new received in a map of available
    // reducers
    stateManager.reducersObj = { ...stateManager.reducersObj, ...reducers };

    // create redux reducer function
    stateManager.reducer = combineReducers(stateManager.reducersObj);

    // if the subsribed component state is new, mount it on the redux store
    if (!getState(storeKey)) {
      store.dispatch({
        type: LOCAL,
        subType: LOCAL_MOUNT,
        state: initialState,
        key: storeKey
      });
    }

    // return unsuscriber function
    return {
      storeKey,
      unsubscribe: unsubscribe.bind(null, storeKey, uid)
    };
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
      state[action.key] = action.state || reducer(undefined, { type: LOCAL_INIT });
      return state;
    },

    [LOCAL_UNMOUNT]: (state, action) => {
      delete state[action.key];
      return state;
    },

    [LOCAL_ACTION]: (state, action, reducer) => {
      state[action.key] = reducer(state[action.key], action.data);
      return state;
    }
  };

  function componentStateReducer(reducer) {
    // `reducer` is the received original redux store reducer function
    // return reducer method signature
    return (state, action) => {
      const { key, type, subType } = action;

      // create temporary state to be processed by specific component state
      // reducers
      let tmpState = {
        [key]: (state || {})[key] || {}
      };

      // process action with the original reducer
      const newState = reducer(state, action);

      // test if the action received is bound to a component state
      if (type === LOCAL && subscribersMap[ key ]) {
        // react properly to component state actions
        let reaction = reactions[subType] || ( (currentState) => currentState );
        reaction(tmpState, action, subscribersMap[key].reducer);
      }

      if (type === LOCAL && tmpState[key]) {
        newState[key] = tmpState[key];
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
