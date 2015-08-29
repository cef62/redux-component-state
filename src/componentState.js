import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {composeActionCreators, validateConfig, getDisplayName} from './utils';

export default function reduxComponentState(componentStoreConfig) {
  validateConfig(componentStoreConfig);

  return (DecoratedComponent) =>
    class ReduxComponentState extends Component {

      static displayName = `ReduxComponentState(${getDisplayName(DecoratedComponent)})`;
      static DecoratedComponent = DecoratedComponent;

      static contextTypes = {
        store: PropTypes.shape({
          componentState: PropTypes.shape({
            subscribe: PropTypes.func.isRequired,
          }).isRequired,
        }),
      };

      constructor(props, context) {
        super(props, context);
        this.dispatchToState = this.dispatchToState.bind(this);
      }

      componentWillMount() {
        const {getKey, reducer, getInitialState, actions} = componentStoreConfig;

        const initialState = (getInitialState || (() => undefined))(this.props);

        const subscription = this.context.store.componentState.subscribe({
          key: getKey(this.props),
          reducer,
          initialState,
        });

        this.unsubscribe = subscription.unsubscribe;
        this.dispatch = subscription.dispatch;
        this.boundActionCreators = composeActionCreators(actions, subscription.dispatch);
        this.ReduxConnectWrapper = this.createReduxConnector(subscription.storeKey);
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      createReduxConnector(key) {
        function mapStateToProps(state) {
          return Object.assign( {}, state[key] );
        }
        return connect(mapStateToProps)(DecoratedComponent);
      }

      dispatchToState(action) {
        return this.dispatch(action);
      }

      render() {
        const childProps = Object.assign( {},
            this.props, {
              ref: 'ReduxComponentStateConnector',
              dispatchToState: this.dispatchToState,
            },
            this.boundActionCreators
            );

        return React.createElement(this.ReduxConnectWrapper, childProps);
      }
    };
}
