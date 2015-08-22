import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import {
  LOCAL,
  LOCAL_ACTION
} from './actionTypes';

// TODO: move in an utilities module
function getDisplayName(Comp) {
  return Comp.displayName || Comp.name || 'Component';
}

function createComponentStateDecorator(componentStoreConfig) {
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
        this.state = this.getComponentStoreState();
      }

      // ****************************************************************
      // Component LifeCycle
      // ****************************************************************

      componentDidMount() {
        const {
          getKey,
          reducers,
          actions,
          getInitialState,
          shared
        } = componentStoreConfig;

        let initialState = (getInitialState || (() => undefined))(this.props);
        this.unsubscribe = this.context.store.componentState.subscribe({
          key: getKey(this.props),
          reducers,
          initialState,
          shared,
          onChange: this.handleChange
        });
        this.handleChange();
      }

      componentWillUnmount() {
        this.unsubscribe();
      }

      // ****************************************************************
      // Internal API
      // ****************************************************************

      getComponentStateKey(){
        return componentStoreConfig.getKey(this.props);
      }

      getComponentStoreState(){
        return this.context.store.componentState.getState(this.getComponentStateKey());
      }

      handleChange = () => {
        // TODO: add conditions to prevent rendering if the
        // state is not changed
        this.setState(this.getComponentStoreState());
      }

      dispatchLocal = (action) => {
        this.context.store.dispatch({
          type: LOCAL,
          subType: LOCAL_ACTION,
          key: this.getComponentStateKey(),
          data: action
        });
      }

      // ****************************************************************
      // Render component
      // ****************************************************************

      render() {
        const { ...stuff } = this.props;
        let actions = componentStoreConfig.actions || {};
        const boundActionCreators = bindActionCreators(actions, this.dispatchLocal);

        // FIXME: temporary fix because first render of the component fires
        // before the component store is initialized
        if(!this.state) return <span />;
        
        // const renderDecoratedComp = () =>
        //     <DecoratedComponent
        //         dispatch={this.dispatchLocal}
        //         {...this.stuff}
        //         {...this.state}
        //         {...boundActionCreators}
        //     />;

        return (
            <div>
            <DecoratedComponent ref="ReduxComponentStateWrapper"
                dispatch={this.dispatchLocal}
                {...this.stuff}
                {...this.state}
                {...boundActionCreators}
            />
            </div>
        );
      }
    }
}


export default function reduxComponentState(componentStoreConfig) {
  const decorator = createComponentStateDecorator(componentStoreConfig);
  // TODO: is required this intermediate function?
  // there's need to manipulate the decorator here?
  return decorator;
}
