export * from './common';

import {registerCompile} from 'intact-shared';
import {compile} from 'vdt';
export {compile};

registerCompile(compile);
