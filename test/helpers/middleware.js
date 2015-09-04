export function thunk({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}

export function testMiddleware(suffix) {
  return () => next => action => {
    action.text = action.text + suffix;
    return next(action);
  };
}


