import React, { Component, PropTypes } from 'react';

import reduxComponentState from 'redux-component-state';

import * as compActions from './redux/actions';
import counter from './redux/counterReducer';

class CounterPanel extends Component {

  static propTypes = {
    compActions: PropTypes.object.isRequired,
    counter: PropTypes.shape({
      value: PropTypes.number.isRequired,
      interactionCount: PropTypes.number.isRequired
    }).isRequired
  }

  static defaultProps = {}

  render() {
    const {increment, decrement} = this.props.compActions;

    return (
        <div>
          Current Count: {this.props.counter.value} <br/>
          Number of interactions: {this.props.counter.interactionCount}
          <br/>
          <button onClick={ () => increment() }>increment</button>
          <button onClick={ () => decrement() }>decrement</button>
        </div>
    );
  }
}

const componentStateConfig = {
  getKey(props) {
    let id = props.id || 'defaultCounterPanel';
    return `counter-${id}`;
  },
  reducers: {counter},
  actions: { compActions }
};
export default reduxComponentState(componentStateConfig)(CounterPanel);
