import {
  INCREMENT,
  DECREMENT
} from './actionTypes';

const initialState = {
  value: 0,
  interactionCount: 0
};

function update({value, interactionCount}, action) {
  const newInteractionCount = interactionCount + 1;
  const newValue = value + action.value;
  return { value: newValue, interactionCount: newInteractionCount };
}

export default function(state = initialState, action) {
  let newState;
  switch (action.type) {

    case INCREMENT:
    case DECREMENT:
      newState = update(state, action);
      break;

    default:
      newState = state;
  }
  return newState;
}
