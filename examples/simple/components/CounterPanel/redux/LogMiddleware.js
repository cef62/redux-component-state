/* eslint no-unused-vars:0 no-console:0*/
export default function logMiddleware({dispatch, getState}) {
  return next => action => {
    const { type } = action;
    console.log(`Middleware Logger. type: ${type}`);
    return next(action);
  };
}

