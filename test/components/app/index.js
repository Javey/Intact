import Intact from '../../../src';
import template from './app.vdt';

export default Intact.extend({
    defaults: {
        view: undefined
    },
    
    template: template,

    load(Page, data) {
        const page = new Page(data);
        this.set('view', page);
        return page;
    }
});

