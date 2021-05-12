export * from './common';
import {error} from 'intact-shared';
import {registerCompile} from 'vdt';

function compile() {
    if (process.env.NODE_ENV !== 'production') {
        error('Runtime compilation is not support in this build of Intact.');
    }
}

registerCompile(compile as any);
