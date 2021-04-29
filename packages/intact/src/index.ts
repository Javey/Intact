export * from './utils/types';
export {Component} from './core/component';
export {nextTick} from './utils/componentUtils';
import {registerCompile} from './utils/helpers';
import {compile} from 'vdt';

registerCompile(compile);
