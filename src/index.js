// import Animate from './animate';
import Intact from './intact';
import Vdt from 'vdt';
import A from './A';

Intact.prototype.Animate = A;
// Intact.Animate = Animate;
Intact.Animate = A;
Intact.Vdt = Vdt;
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
