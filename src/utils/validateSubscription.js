/*
   let subscriptiom = {
     key: PropTypes.string.isRequired,
     reducers: PropTypes.object.isRequired,
     initialState: PropTypes.object,
     middlewares: Proptypes.array,
   }
*/
export default function validateSubscription(subscription) {
  const prefix = 'Redux Component State Store Subscription';

  if (!subscription) {
    throw new Error(`${prefix} requires a subscription object.`);
  }

  const { key, reducer, initialState, middlewares } = subscription;

  if (!key || typeof key !== 'string' || !key.length ) {
    throw new Error(`${prefix} requires a valid key identifier.`);
  }

  if (typeof reducer !== 'function' ) {
    throw new Error(`${prefix} expected the reducer to be a function.`);
  }

  if (middlewares && !Array.isArray(middlewares)) {
    throw new Error(`${prefix} expected middlewares to be an array.`);
  }

  if (initialState) {
    const reducerStructure = reducer(undefined, {});
    const requiredStates = Object.keys(reducerStructure).filter( red => !red.startsWith('_') );
    const states = Object.keys(initialState).filter( prop => !prop.startsWith('_') );
    const missingInitialStates = states.filter(
        st => !requiredStates.find( ref => ref === st ) );

    if (missingInitialStates.length) {
      throw new Error(`${prefix} require a complete initial state for every reducer passed`);
    }
  }
}
