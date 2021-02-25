import DocumentPage from '../document';
import template from './api.vdt';
import css from './api.styl';

export default class extends DocumentPage {
    @Intact.template()
    get template() { return template; } 
}
