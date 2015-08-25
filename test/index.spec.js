import { expect } from 'chai';
import reduxComponentState, { reduxComponentStateStore } from '../src';

describe('reduxComponentState', () => {
  it('should exists and be a function', () => {
    expect(reduxComponentState).to.exist;
    expect(reduxComponentState).to.be.an.instanceof(Function);
  });
});

describe('reduxComponentStateStore', () => {
  it('should exists and be a function', () => {
    expect(reduxComponentStateStore).to.exist;
    expect(reduxComponentStateStore).to.be.an.instanceof(Function);
  });
});
