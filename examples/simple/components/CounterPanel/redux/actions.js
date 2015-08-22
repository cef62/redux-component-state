import {
  INCREMENT,
  DECREMENT
} from './actionTypes';

export function increment(multiplier = 1) {
  return {
    type: INCREMENT,
    value: multiplier
  };
}

export function decrement(multiplier = 1) {
  return {
    type: DECREMENT,
    value: (-multiplier)
  };
}

