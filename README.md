# redux-component-state

[![Build Status](https://travis-ci.org/cef62/redux-component-state.svg?branch=master)](https://travis-ci.org/cef62/redux-component-state)
[![npm version](https://img.shields.io/npm/v/redux-component-state.svg?style=flat-square)](https://www.npmjs.com/package/redux-component-state) 

Component level state's manager using redux reducers to support on-demand store creation.

This project is born to satisfy some requirement for an internal app. We needed  to create and destroy store fragments on-demand for some specific component. Initially we tried to define specific component reducers, registering them at application start. It worked fine but we not liked define component specific details at application level.
Reducer and action creators of a component state should be isolated and available only to its owner component.

[This discussion](https://github.com/rackt/redux/issues/159) is related with our requirements and the initial proposal of Dan Abramov (@gaeron) and the experiment from Taylor Hakes (@taylorhakes) helped out to create this project.   
Thanks to both!

The project is in its initial state and lot of work still needs to be done but should be fairly safe to use. We use it in production in a small app and at the moment we haven't found problems.

## Todos

- [ ] add complete test coverage (currently WIP)
- [ ] add usage examples
- [ ] add jsdocs and remove verbose code comments
- [ ] improve subscription object API:
  - [ ] add reset() method
- [ ] separate `componentStateStore` and `componentState` HoC in different projects
    to permit use of component states with other libraries than React
- [ ] further investigate if the current approach bring performance downsides

## Install

Install it via npm: `npm install --save redux-component-state`.

## How to use

Waiting to better introduction look the example code.
