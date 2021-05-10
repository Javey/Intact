export * from './common';

import {registerCompile, error} from 'intact-shared';

export function compile() {
    if (process.env.NODE_ENV !== 'production') {
        error('Runtime compilation is not support in this build of Intact.');
    }
}

registerCompile(compile);
