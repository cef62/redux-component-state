import {bindActionCreators} from 'redux';
import { filterPrivateField } from './filters';

export default function composeActionCreators(actions, dispatch) {
  let boundACs;
  if (actions) {
    const keys = Object.keys(actions).filter(filterPrivateField);
    if (keys.length) {
      if (typeof actions[keys[0]] === 'function') {
        // single map of ACs
        boundACs = bindActionCreators(actions, dispatch);
      } else {
        // nested map of ACs
        boundACs = keys.reduce( (acc, key) => {
          acc[key] = bindActionCreators(actions[key], dispatch);
          return acc;
        }, {});
      }
    }
  }
  return boundACs;
}

