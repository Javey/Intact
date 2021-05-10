export * from './utils/types';
export {Component} from './core/component';
export {nextTick} from './utils/componentUtils';
export {Transition, TransitionProps} from './components/transition';
export {TransitionGroup, TransitionGroupProps} from './components/transitionGroup';
export * from 'vdt/runtime';
import {defaultOptions} from 'vdt/runtime';
import {get, set} from './utils/helpers';

defaultOptions.get = get;
defaultOptions.set = set;
