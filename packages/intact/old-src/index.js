import Intact from './instance';
import Vdt from 'vdt/src/client';
import Animate from './animate';
import * as utils from './utils';

Intact.prototype.Animate = Animate;
Intact.Animate = Animate;
Intact.Vdt = Vdt;
Intact.utils = utils;
Vdt.configure({
    getModel(self, key) {
        return self.get(key);
    },
    setModel(self, key, value) {
        // self.set(key, value, {async: true});
        self.set(key, value);
    }
});

export default Intact;
