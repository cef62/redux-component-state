import {
  STATE_ACTION,
  INIT,
  MOUNT,
  UNMOUNT,
  ACTION,
  KEY
} from './actionTypes';

import validateSubscription from './utils/validateSubscription';

export default function createComponentStateStore(next) {
  // map of component state subscribers
  const subscribersMap = {};

  // redux store
  let store;

  // ****************************************************************
  // getState method,
  // the state is sliced with only the specific component state of
  // the subscriber
  // ****************************************************************

  function getStateKey(key) {
    return KEY + key;
  }

  // ****************************************************************
  // dispatch method for component state actions
  // ****************************************************************

  function dispatch(key, action) {
    return store.dispatch({
      type: STATE_ACTION,
      subType: ACTION,
      key: key,
      data: action,
    });
  }

  // ****************************************************************
  // unsubscribe method,
  // passed upon the subscription
  // ****************************************************************

  function unsubscribe(key) {
    // unmount the component store
    store.dispatch({ type: STATE_ACTION, subType: UNMOUNT, key });

    // clear subscriber data
    Reflect.deleteProperty(subscribersMap, key);
  }

  // ****************************************************************
  // subscribe method,
  // passed to children via `store context`
  // ****************************************************************

  function subscribe(subscription) {
    validateSubscription(subscription);

    const { key, reducer, initialState } = subscription;

    // compose unique store-key
    const storeKey = getStateKey(key);

    if (subscribersMap[storeKey]) {
      throw new Error(`The redux componentStore with key: ${key} is already registered!`);
    }

    // create redux reducer function
    subscribersMap[storeKey] = reducer;

    // mount the new state on the redux store
    store.dispatch({
      type: STATE_ACTION,
      subType: MOUNT,
      key: storeKey,
      state: initialState,
    });

    // return unsuscriber function
    return {
      storeKey,
      dispatch: dispatch.bind(null, storeKey),
      unsubscribe: unsubscribe.bind(null, storeKey),
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
   *          state, used to override initial component state mounting default
   *          value
   *  data: {required for subtype === ACTION } original action submitted
   * }
   */
  const reactions = {
    [MOUNT]: (state, action, reducer) => {
      state[action.key] = action.state || reducer(undefined, { type: INIT });
      return state;
    },

    [UNMOUNT]: (state, action) => {
      delete state[action.key];
      return state;
    },

    [ACTION]: (state, action, reducer) => {
      state[action.key] = reducer(state[action.key], action.data);
      return state;
    },
  };

  function applyComponentStateReducers(action, state, newState) {
    const { key, type, subType } = action;
    const reducer = subscribersMap[key];

    const tmpState = Object.keys(subscribersMap).reduce( (acc, storeKey) => {
      acc[storeKey] = (state || {})[storeKey];
      return acc;
    }, {});

    // test if the action received is bound to a component state
    if (type === STATE_ACTION && reducer) {
      tmpState[key] = tmpState[key] || {};

      // react properly to component state actions
      const reaction = reactions[subType] || ( (cs) => cs );
      reaction(tmpState, action, reducer);
    }
    Object.assign(newState, tmpState);
    return newState;
  }

  function componentStateReducer(reducer) {
    // `reducer` is the received original redux store reducer function
    // return reducer method signature
    return (state, action) => {
      // process action with the original reducer
      let newState = reducer(state, action);
      newState = applyComponentStateReducers(action, state, newState);
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
      },
    };
  };
}
