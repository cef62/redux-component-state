/*
   let subscriptiom = {
     key: PropTypes.string.isRequired,
     reducers: PropTypes.object.isRequired,
    initialState: PropTypes.object
   }
   */
export default function validateSubscription(subscription) {
  const prefix = 'Redux Component State Store Subscription';

  if (!subscription) {
    throw new Error(`${prefix} requires a subscription object.`);
  }

  const { key, reducer, initialState } = subscription;

  if (!key || typeof key !== 'string' || !key.length ) {
    throw new Error(`${prefix} requires a valid key identifier.`);
  }

  if (typeof reducer !== 'function' ) {
    throw new Error(`${prefix} expected the reducer to be a function.`);
  }

  if (initialState) {
    const reducerStructure = reducer(undefined, {});
    let requiredStates = Object.keys(reducerStructure).filter( red => !red.startsWith('_') );
    let states = Object.keys(initialState).filter( prop => !prop.startsWith('_') );
    let missingInitialStates = states.filter(
        st => !requiredStates.find( ref => ref === st ) );

    if (missingInitialStates.length) {
      throw new Error(`${prefix} require a complete initial state for every reducer passed`);
    }
  }
}
