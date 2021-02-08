function dispatchEvent(target, eventName, options) {
    var event;
    if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    } else if (document.createEventObject) {
        event = document.createEventObject();
        return target.fireEvent('on' + eventName, event);
    } else if (typeof CustomEvent !== 'undefined') {
        event = new CustomEvent(eventName);
    }
    target.dispatchEvent(event);
}

describe('Template Inherit', function() {
    it('should render parent template correctly', function() {
        var parent = Vdt(document.getElementById('parent').innerHTML),
            $dom = $(parent.render({title: 'parent'})), $children = $dom.children(); 
        $children.length.should.be.eql(4);
        $children.eq(0).hasClass('head').should.be.eql(true);
        $children.eq(0).text().should.be.eql('parent');
        $children.eq(1).text().should.be.eql('parent body');
        $children.eq(2).text().should.be.eql('parent footer');
        $children.eq(3).text().should.be.eql('parent nested footer');
    });

    it('should render child template correctly', function() {
        var child = Vdt(document.getElementById('child').innerHTML),
            $dom = $(child.render()),
            $children = $dom.children();

        $children.length.should.be.eql(6);
        $children.eq(0).hasClass('head').should.be.eql(true);
        $children.eq(0).text().should.be.eql('child title');
        $children.eq(1).text().should.be.eql('child body');
        $children.eq(2).text().should.be.eql('parent footer');
        $children.eq(3).text().should.be.eql('parent nested footer');
        $children.eq(4).text().should.be.eql('child footer');
        $children.eq(5).text().should.be.eql('child nested footer');
    });

    it('should not get data in parent template if not passed', function() {
        var child = Vdt(document.getElementById('child').innerHTML),
            $dom = $(child.render({title: 'child'}));

        $dom.find('.head').text().should.be.eql('child title');
    });

    it('should pass data to parent template correctly', function() {
        var child = Vdt(document.getElementById('pass_arguments').innerHTML),
            $dom = $(child.render({title: 'child'}));

        $dom.find('.head').text().should.be.eql('child');
    });


    it('should render grandson template correctly', function() {
        var grandson = Vdt(document.getElementById('grandson').innerHTML),
            $dom = $(grandson.render()),
            $children = $dom.children();

        $children.length.should.be.eql(8);
        $children.eq(0).text().should.be.eql('grandson title');
        $children.eq(1).text().should.be.eql('grandson body');
        $children.eq(2).text().should.be.eql('parent footer');
        $children.eq(3).text().should.be.eql('parent nested footer');
        $children.eq(4).text().should.be.eql('child footer');
        $children.eq(5).text().should.be.eql('child nested footer');
        $children.eq(6).text().should.be.eql('grandson footer');
        $children.eq(7).hasClass('card').should.be.eql(true);
        $children.eq(7).children().length.should.be.eql(6);
        $children.eq(7).children().eq(0).text().should.be.eql('nested template');
    });

    it('should render directive correctly', function() {
        var vdt = Vdt(document.getElementById('directive').innerHTML),
            $dom = $(vdt.render({data: ['a', 'b', 'c']})),
            $children = $dom.children();
        
        $children.length.should.be.eql(2);
        $children.eq(0).text().should.be.eql('a');
        $children.eq(1).text().should.be.eql('c');
    });

    it('should render object className correctly', function() {
        var vdt = Vdt('<div class={{a: true, "b c": 1}}><div class="{a: 1}"></div></div>'),
            $dom = $(vdt.render());
        $dom.attr('class').should.be.eql('a b c');
        $dom.children().eq(0).attr('class').should.be.eql('{a: 1}');

        vdt = Vdt('var className = {a: true, "b c": 1}; <div class={className}></div>');
        $dom = $(vdt.render());
        $dom.attr('class').should.be.eql('a b c');
        vdt = Vdt('var className = null; <div class={className}></div>');
        $dom = $(vdt.render());
        ($dom.attr('class') === undefined).should.be.true;
        vdt = Vdt('var className = undefined; <div class={className}></div>');
        $dom = $(vdt.render());
        ($dom.attr('class') === undefined).should.be.true;
    });

    it('should render inline style correctly', function() {
        var vdt = Vdt(document.getElementById('inline_style').innerHTML),
            $dom = $(vdt.render({a: 1}));
        $dom.children().each(function() {
            $.trim($(this).attr('style')).should.eql('display: block;');
        });
        vdt.update({a: 2});
        var style1 = $dom.children().eq(0).attr('style'),
            style2 = $dom.children().eq(2).attr('style');
        (style1 === undefined || style1 === '').should.be.true;
        $.trim($dom.children().eq(1).attr('style')).should.eql('display: none;');
        (style2 === undefined || style2 === '').should.be.true;
    });

    it('should render v-model of text correctly', function() {
        var vdt = Vdt(document.getElementById('v-model-text').innerHTML),
            dom = vdt.render({text: ''});
        $('body').append(dom);
        dom.value.should.eql('');
        dom.value = 'test';
        dispatchEvent(dom, 'input');
        vdt.data.text.should.eql('test');

        $(dom).remove();
    });

    it('should render v-model of radio correctly', function() {
        var vdt = Vdt(document.getElementById('v-model-radio').innerHTML),
            $dom = $(vdt.render({
                radioConst: '',
                radioVar: '2',
                variable: 2,
                radioNo: '',
                radioGroup: '2',
                list: ['1', '2', '3']
            }));

        $('body').append($dom);

        var children = $dom.children();
        var checked = [false, false, false, false, true, false, false];

        checked.forEach(function(checked, index) {
            children[index].checked.should.eql(checked);
        });

        children.eq(0).click();
        vdt.data.radioConst.should.eql('1');

        children.eq(1).click();
        vdt.data.radioVar.should.eql(2);


        children.eq(2).click();
        vdt.data.radioNo.should.eql(true);

        children.eq(3).click();
        children[3].checked.should.eql(true);
        children[4].checked.should.eql(false);
        vdt.data.radioGroup.should.eql('1');

        children.eq(6).click();
        vdt.data.radioTrueFalse.should.eql('a');

        $dom.remove();
    });

    it('should render v-model of checkbox correctly', function() {
        var vdt = Vdt(document.getElementById('v-model-checkbox').innerHTML),
            $dom = $(vdt.render({
                checkboxConst: '',
                checkboxVar: '2',
                variable: 2,
                checkboxNo: '',
                checkboxGroup: ['2'],
                list: ['1', '2', '3']
            }));

        $('body').append($dom);

        var children = $dom.children();
        var checked = [false, false, false, false, true, false];

        checked.forEach(function(checked, index) {
            children[index].checked.should.eql(checked);
        });

        children.eq(0).click();
        vdt.data.checkboxConst.should.eql('1');
        children.eq(0).click();
        vdt.data.checkboxConst.should.eql(false);

        children.eq(1).click();
        vdt.data.checkboxVar.should.eql(2);
        children.eq(1).click();
        vdt.data.checkboxVar.should.eql(false);

        children.eq(2).click();
        vdt.data.checkboxNo.should.eql(true);
        children.eq(2).click();
        vdt.data.checkboxNo.should.eql(false);

        children.eq(3).click();
        vdt.data.checkboxGroup.should.eql(['2', '1']);
        children.eq(5).click();
        vdt.data.checkboxGroup.should.eql(['2', '1', '3']);
        children.eq(3).click();
        vdt.data.checkboxGroup.should.eql(['2', '3']);
        children.eq(3).click();
        vdt.data.checkboxGroup.should.eql(['2', '3', '1']);
        children.eq(3).click();
        children.eq(4).click();
        children.eq(5).click();
        vdt.data.checkboxGroup.should.eql([]);

        children.eq(6).click();
        vdt.data.checkboxTrueFalse.should.eql('a');
        children.eq(6).click();
        vdt.data.checkboxTrueFalse.should.eql(vdt.data.variable);

        $dom.remove();
    });

    it('should render v-model of select correctly', function() {
        var vdt = Vdt(document.getElementById('v-model-select').innerHTML),
            dom = vdt.render({
                list: ['1', 2, '3']
            });

        $('body').append(dom);
        // dom.value.should.eql('');
        dom.value = '2';
        dispatchEvent(dom, 'change');
        vdt.data.test.should.eql(2);

        $(dom).remove();

        vdt = Vdt(document.getElementById('v-model-select').innerHTML);
        dom = vdt.render({
            test: '2',
            list: ['1', '2', '3']
        });

        dom.value.should.eql('2');
    });

    it('should render v-model of multiple select correctly', function() {
        var vdt = Vdt(document.getElementById('v-model-multiple-select').innerHTML),
            dom = vdt.render({
                list: ['1', 2, '3']
            });

        $('body').append(dom);
        dom.value.should.eql('');
        vdt.data.test = [2];
        vdt.update();
        
        [false, true, false].forEach(function(item, index) {
            dom.options[index].selected.should.eql(item);
        });

        vdt.data.test = ['1', 2, '3'];
        vdt.update();

        [true, true, true].forEach(function(item, index) {
            dom.options[index].selected.should.eql(item);
        });

        vdt.data.test = [];
        vdt.update();

        [false, false, false].forEach(function(item, index) {
            dom.options[index].selected.should.eql(item);
        });

        dom.options[1].selected = true;
        dom.options[2].selected = true;
        dispatchEvent(dom, 'change');
        vdt.data.test.should.eql([2, '3']);

        $(dom).remove();
    });

    it('should render v-model of textarea correctly', function() {
        var vdt = Vdt(document.getElementById('v-model-textarea').innerHTML),
            dom = vdt.render({test: ''});
        $('body').append(dom);
        dom.value.should.eql('');
        dom.value = 'test';
        dispatchEvent(dom, 'input');
        vdt.data.test.should.eql('test');

        $(dom).remove();
    });
});
