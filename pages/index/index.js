import template from './index.vdt';
import css from './index.styl';
import {highlight, marked} from '../../lib/utils';
import Layout from '../layout';

export default class extends Layout {
    @Intact.template()
    get template() { return template; }

    _mount() {
        super._mount();
        const $element = $(this.element);
        const $mds = $element.find('script[type="text/md"]');
        for (let i = 0; i < $mds.length; i++) {
            let $md = $($mds[i]);
            let md = $md.text();
            let html = marked.render(md);
            if ($md.hasClass('show')) {
                $md.nextUntil('.code').next().html(html);
            } else {
                const $div = $('<div />').html(html);
                const $codes = $div.find('pre code');
                let template;
                for (let i = 0; i < $codes.length; i++) {
                    let $code = $($codes[i]);
                    let code = $code.text();
                    if ($code.hasClass('language-html')) {
                        template = Intact.Vdt.compile(code);
                    } else if ($code.hasClass('language-css')) {
                        $code.parent().after(`<style>${code}</style>`);
                    } else if ($code.hasClass('language-js')) {
                        eval(code);
                    }
                }
            } 
        }
        const $codes = $element.find('pre code');
        for (let i = 0; i < $codes.length; i++) {
            let $code = $($codes[i]);
            highlight.highlightBlock($code[0]);
        }
    }
}
