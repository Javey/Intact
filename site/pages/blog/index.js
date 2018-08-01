import Api from '../api';
import template from './index.vdt';
import './index.styl';

export default class extends Api {
    @Intact.template()
    static template = template;

    defaults() {
        return {
            ...super.defaults(),
            docPath: './docs/blogs',
        };
    }
}
