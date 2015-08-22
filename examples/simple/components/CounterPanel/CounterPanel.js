import React, { Component, PropTypes } from 'react'

import reduxComponentState from 'redux-component-state';

import * as actions from './redux/actions';
import counter from './redux/counterReducer';

class CounterPanel extends Component {

  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    counter: PropTypes.shape({
      value: PropTypes.number.isRequired,
      interactionCount: PropTypes.number.isRequired
    }).isRequired
  }

  static defaultProps = {}

  render() {
    const {
      increment, decrement,
      counter: { value, interactionCount }
    } = this.props;

    return (
        <div>
          Current Count: {value} <br/>
          Number of interactions: {interactionCount}
          <br/>
          <button onClick={ e => increment() }>increment</button>
          <button onClick={ e => decrement() }>decrement</button>
        </div>
    );
  }
}

const componentStateConfig = {
  getKey(props) {
    let id = props.id || 'defaultCounterPanel';
    return `counter-${id}`;
  },
  reducers: { counter },
  actions
};
export default reduxComponentState(componentStateConfig)(CounterPanel);
