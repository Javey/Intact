import Intact from '../../../src';
import template from './app.vdt';

export default Intact.extend({
    defaults: {
        view: undefined
    },
    
    template: template,

    load(Page, data) {
        this.set('view', new Page(data));
    }
});

