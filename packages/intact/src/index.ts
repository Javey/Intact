export * from './utils/types';
export {Component} from './core/component';
export {nextTick} from './utils/componentUtils';
export {Transition, TransitionProps} from './components/transition';
export {TransitionGroup, TransitionGroupProps} from './components/transitionGroup';
import {registerCompile} from 'intact-shared';
import {compile} from 'vdt';
export {compile};

registerCompile(compile);
