import Intact from '../instance';
import prototype from './prototype';
import './mount';
import './update';
import './destroy';
import './unmount';

const Animate = Intact.extend(prototype);
export default Animate;
