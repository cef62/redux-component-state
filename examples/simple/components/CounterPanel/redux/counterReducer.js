import {
  INCREMENT,
  DECREMENT
} from './actionTypes';

const initialState = {
  value: 0,
  interactionCount: 0
};

function update({value, interactionCount}, {value: valueModifier}){
  interactionCount++;
  value = value + valueModifier;
  return { value, interactionCount };
}

export default function(state = initialState, action) {
  switch(action.type) {

    case INCREMENT:
      return update(state, action);
      break;

    case DECREMENT:
      return update(state, action);
      break;

    default:
      return state;
  }
}
