import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

function getDisplayName(Comp) {
  return Comp.displayName || Comp.name || 'Component';
}

export default function reduxComponentState(componentStoreConfig) {
  // TODO: add validation of shape fo the storeConfig
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
            subscribe: PropTypes.func,
            unsubscribe: PropTypes.func,
            getState: PropTypes.func
          }).isRequired
        })
      };

      // static propTypes = {
      //   componentStoreConfig: PropTypes.shape({
      //     getKey: PropTypes.func,
      //     reducers: PropTypes.object,
      //     actions: PropTypes.object,
      //     getInitialState: PropTypes.func,
      //     shared: PropTypes.bool
      //   }).isRequired
      // };

      constructor(props, context) {
        super(props, context);
      }

      // ****************************************************************
      // Component LifeCycle
      // ****************************************************************

      componentWillMount() {
        const {
          getKey,
          reducers,
          actions,
          getInitialState,
          shared
        } = componentStoreConfig;

        let initialState = (getInitialState || (() => undefined))(this.props);
        let subscription = this.context.store.componentState.subscribe({
          key: getKey(this.props),
          reducers,
          initialState,
          shared
        });
        this.unsubscribe = subscription.unsubscribe;
        this.storeKey = subscription.storeKey;
        this.dispatch = subscription.dispatch;

        // REACT-REDUX CONNECT
        function mapStateToProps(state) {
          return {...state[subscription.storeKey]};
        }
        this.reduxConnectWrapper = connect(mapStateToProps)(DecoratedComponent);
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      // ****************************************************************
      // Internal API
      // ****************************************************************

      dispatchLocal = (action) => {
        return this.dispatch(this.storeKey, action);
      }

      // ****************************************************************
      // Render component
      // ****************************************************************

      render() {
        const { ...stuff } = this.props;
        let actions = componentStoreConfig.actions || {};
        const boundActionCreators = bindActionCreators(actions, this.dispatchLocal);

        return (
            <this.reduxConnectWrapper
                ref="ReduxComponentStateWrapper"
                dispatch={this.dispatchLocal}
                {...this.stuff}
                {...boundActionCreators}
            />
        );
      }
    };
}
