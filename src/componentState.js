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
        const {
          getKey,
          reducer,
          getInitialState,
          actions,
          middlewares,
        } = componentStoreConfig;

        const initialState = (getInitialState || (() => undefined))(this.props);

        this.subscription = this.context.store.componentState.subscribe({
          key: getKey(this.props),
          reducer,
          initialState,
          middlewares,
        });

        this.boundActionCreators = composeActionCreators(actions, this.subscription.dispatch);
        this.ReduxConnectWrapper = this.createReduxConnector(this.subscription.storeKey);
      }

      componentWillUnmount() {
        this.subscription.unsubscribe();
        Reflect.deleteProperty(this, 'subscription');
      }

      createReduxConnector(key) {
        function mapStateToProps(state) {
          return Object.assign( {}, state[key] );
        }
        return connect(mapStateToProps)(DecoratedComponent);
      }

      dispatchToState(action) {
        return this.subscription.dispatch(action);
      }

      render() {
        const childProps = Object.assign( {},
            this.props, {
              ref: 'ReduxComponentStateConnector',
              dispatchToState: this.dispatchToState,
              getComponentState: this.subscription.getState,
            },
            this.boundActionCreators
            );

        return React.createElement(this.ReduxConnectWrapper, childProps);
      }
    };
}
