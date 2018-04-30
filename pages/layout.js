import template from './layout.vdt';

export default class extends Intact {
    @Intact.template()
    static template = template;

    _mount() {
        this.$border = $(this.element).find('.border');
        this._updateBorder();
    }

    _updateBorder() {
        const $nav = $(this.element).find('.active');
        let width = 0;
        let left = 0;
        if ($nav.length) {
            left = $nav.position().left;
            width = $nav.outerWidth();
        }
        this.$border.addClass('transition');
        this.$border.css({width: width, left: left});
    }
}
