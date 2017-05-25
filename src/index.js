import Animate from './animate';
import Intact from './intact';
import Vdt from 'vdt';

Intact.prototype.Animate = Animate;
Intact.Animate = Animate;
Intact.Vdt = Vdt;

export default Intact;
