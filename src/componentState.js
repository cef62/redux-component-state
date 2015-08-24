import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {validateConfig, getDisplayName} from './utils';

export default function reduxComponentState(componentStoreConfig) {
  validateConfig(componentStoreConfig);

  return (DecoratedComponent) =>
    class ReduxComponentState extends Component {

      // ****************************************************************
      // Component initialization
      // ****************************************************************

      static displayName = `ReduxComponentState(${getDisplayName(DecoratedComponent)})`;
      static DecoratedComponent = DecoratedComponent;

      static contextTypes = {
        store: PropTypes.shape({
          componentState: PropTypes.shape({
            subscribe: PropTypes.func.isRequired
          }).isRequired
        })
      };

      // ****************************************************************
      // Component LifeCycle
      // ****************************************************************

      constructor(props, context) {
        super(props, context);
        this.dispatchLocal = this.dispatchLocal.bind(this);
      }

      componentWillMount() {
        const {getKey, reducers, getInitialState} = componentStoreConfig;

        const initialState = (getInitialState || (() => undefined))(this.props);

        const subscription = this.context.store.componentState.subscribe({
          key: getKey(this.props),
          reducers,
          initialState
        });
        this.unsubscribe = subscription.unsubscribe;
        this.dispatch = subscription.dispatch;

        this.ReduxConnectWrapper = this.createReduxConnector(subscription.storeKey);
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      // ****************************************************************
      // Internal API
      // ****************************************************************

      createReduxConnector(key) {
        function mapStateToProps(state) {
          return Object.assign( {}, state[key] );
        }
        return connect(mapStateToProps)(DecoratedComponent);
      }

      dispatchLocal(action) {
        return this.dispatch(action);
      }

      // ****************************************************************
      // Render component
      // ****************************************************************

      render() {
        const {...stuff} = this.props;
        const {actions = {} } = componentStoreConfig;
        const {aggregate, map} = actions;

        let boundActionCreators;
        if (map) boundActionCreators = bindActionCreators(map, this.dispatchLocal);

        return this.composeChild(
            stuff,
            this.dispatchLocal,
            boundActionCreators,
            aggregate
            );
      }

      composeChild(stuff, dispatch, actions, aggregate) {
        let childProps = {
          ...stuff,
          ref: 'ReduxComponentStateWrapper',
          dispatch
        };

        if (actions && aggregate) {
          childProps[aggregate] = actions;
        } else {
          childProps = Object.assign( childProps, actions );
        }

        return React.createElement(this.ReduxConnectWrapper, childProps);
      }
    };
}
