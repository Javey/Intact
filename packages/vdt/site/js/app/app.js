import App from 'kpc/src/components/app';
import template from './app.vdt';
import css from '../../css/loading.css';

var VdtApp = App.extend({
    template: template,

    _init() {
        this.locals = {};
    }
});

export default Intact.mount(VdtApp, document.getElementById('page'));
