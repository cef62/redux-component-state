import invariant from 'invariant';
import isPlainObject from 'redux/lib/utils/isPlainObject';
import { filterPrivateField } from './filters';
/*
   let config = {
   getKey: PropTypes.func.isRequired,
   reducers: PropTypes.object.isRequired,
   getInitialState: PropTypes.func,
   actions: PropTypes.object
   };
   */
export default function validateConfig(config) {
  const prefix = 'Redux Component State';
  invariant( config, `${prefix} requires a configuration object.`);

  const { getKey, reducer, actions} = config;

  invariant(
      typeof getKey === 'function',
      `${prefix} requires a getKey() function.`
      );
  invariant(
      typeof reducer === 'function',
      `${prefix} expected the reducer to be a function.`
      );
  invariant(
      Object.keys(actions).length,
      `${prefix} can't have an empty map of actions`
      );
  if (actions) {
    const topLevelItem = Object.keys(actions)
      .filter(filterPrivateField)
      .map(act => actions[act]);
    invariant(
        topLevelItem.every( item => typeof item === 'function' )
        || topLevelItem.every( item => {
          if (!isPlainObject(item)) return false;
          let keys = Object.keys(item).filter(filterPrivateField);
          if (!keys.length) return false;
          return keys.every( sub => typeof item[sub] === 'function' );
        }),
        `${prefix} requires an actions map where every key is a function or a map of function.`
        );
  }
}
