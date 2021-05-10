export * from './common';

import {registerCompile} from 'misstime';
import {vdtCompile} from 'vdt';

registerCompile(vdtCompile);
