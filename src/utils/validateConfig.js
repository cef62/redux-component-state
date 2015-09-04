import isPlainObject from 'redux/lib/utils/isPlainObject';
import { filterPrivateField } from './filters';
/*
   let config = {
   getKey: PropTypes.func.isRequired,
   reducers: PropTypes.object.isRequired,
   getInitialState: PropTypes.func,
   actions: PropTypes.object,
   middlewares: Proptypes.array,
   };
   */
export default function validateConfig(config) {
  const prefix = 'Redux Component State';

  if (!config) {
    throw new Error(`${prefix} requires a configuration object.`);
  }

  const { getKey, reducer, actions, middlewares } = config;

  if (typeof getKey !== 'function' ) {
    throw new Error(`${prefix} requires a getKey() function.`);
  }

  if (typeof reducer !== 'function' ) {
    throw new Error(`${prefix} expected the reducer to be a function.`);
  }

  if (middlewares && !Array.isArray(middlewares)) {
    throw new Error(`${prefix} expected middlewares to be an array.`);
  }

  if (actions) {
    if (!Object.keys(actions).length) {
      throw new Error(`${prefix} can't have an empty map of actions`);
    }

    const topLevelItem = Object.keys(actions)
      .filter(filterPrivateField)
      .map(act => actions[act]);

    if (
        !topLevelItem.every( item => typeof item === 'function' )
        && !topLevelItem.every( item => {
          if (!isPlainObject(item)) return false;
          const keys = Object.keys(item).filter(filterPrivateField);
          if (!keys.length) return false;
          return keys.every( sub => typeof item[sub] === 'function' );
        })
       ) {
      throw new Error(`${prefix} requires an actions map where every key is a function or a map of function.`);
    }
  }
}
