import invariant from 'invariant';

/*
let config = {
  getKey: PropTypes.func.isRequired,
  reducers: PropTypes.object.isRequired,
  getInitialState: PropTypes.func,

  actions: Proptypes.shape( {
    aggregate: Proptypes.string,
    map: PropTypes.object.isRequired
  })
};
*/
export default function validateConfig(config) {
  const prefix = 'Redux Component State';
  invariant( config, `${prefix} requires a configuration object.`);

  const {getKey, reducers, actions = {}} = config;
  const {map, aggregate} = actions;

  invariant(
      typeof getKey === 'function',
      `${prefix} requires a getKey() function.`
      );
  invariant(
      typeof reducers === 'object' && Object.keys(reducers),
      `${prefix} requires a reducer map with at least one reducer.`
      );
  invariant(
      Object.keys(reducers)
      .filter(red => !red.startsWith('_'))
      .map(red => reducers[red])
      .map(red => typeof red === 'function')
      .every(red => red),
      `${prefix} requires a reducer map where every key is a function`
      );
  invariant(
      Object.keys(map).length,
      `${prefix} can't have an empty map of actions`
      );
  if (map) {
    invariant(
        Object.keys(map)
        .filter(act => !act.startsWith('_'))
        .map(act => map[act])
        .map(act => typeof act === 'function')
        .every(red => red),
        `${prefix} requires an actions map where every key is a function`
        );
  }
  if (aggregate) {
    invariant(
        map,
        `${prefix} should define an aggregation field only if a map of actions is available`
        );
  }
}
