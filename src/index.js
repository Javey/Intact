import Animate from './animate';
import Intact from './intact';
import Vdt from 'vdt';

Intact.prototype.Animate = Animate;
Intact.Animate = Animate;
Intact.Vdt = Vdt;
Vdt.configure({
    getModel(self, key) {
        return self.get(key);
    },
    setModel(self, key, value) {
        self.set(key, value, {async: true});
    }
});

export default Intact;
