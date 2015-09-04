import React, { Component, PropTypes } from 'react';

import reduxComponentState from 'redux-component-state';

import * as compActions from './redux/actions';
import CounterState from './redux/CounterState';
import LogMiddleware from './redux/LogMiddleware';

class CounterPanel extends Component {

  static propTypes = {
    compActions: PropTypes.object.isRequired,
    getComponentState: PropTypes.func.isRequired,
    counter: PropTypes.shape({
      value: PropTypes.number.isRequired,
      interactionCount: PropTypes.number.isRequired,
    }).isRequired,
  }

  static defaultProps = {}

  render() {
    const { compActions: actions, counter } = this.props;
    const { increment, decrement } = actions;

    return (
        <div>
          Current Count: {counter.value} <br/>
          Number of interactions: {counter.interactionCount}
          <br/>
          <button onClick={ () => increment() }>increment</button>
          <button onClick={ () => decrement() }>decrement</button>
        </div>
    );
  }
}

const componentStateConfig = {
  getKey(props) {
    const { id = 'defaultCounterPanel' } = props;
    return `counter-${id}`;
  },
  reducer: CounterState,
  actions: { compActions },
  middlewares: [ LogMiddleware ],
};
export default reduxComponentState(componentStateConfig)(CounterPanel);
