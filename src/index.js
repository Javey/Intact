import Animate from './animate';
import Intact from './intact';
import Vdt from 'vdt';

Intact.prototype.Animate = Animate;
Intact.Animate = Animate;

export default Intact;
export {Vdt};

module.exports = exports['default'];
module.exports.Vdt = exports.Vdt;
