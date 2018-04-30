import template from './app.vdt';
import css from './loading.css'; 

export default class extends Intact {
    get template() { return template; }

    defaults() {
        return {
            view: undefined,
            loading: false
        };
    }

    run(data) {
        return (Page) => {
            this.set('loading', true);
            const page = new Page(data);
            this.set('view', page);
            // for debug
            window.__page__ = page;
            if (page.inited) {
                this.set('loading', false);
                $(window).scrollTop(0);
            } else {
                page.one('$inited', () => {
                    this.set('loading', false);
                    $(window).scrollTop(0);
                });
            }
        };
    }
}
