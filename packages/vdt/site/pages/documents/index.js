// import marked from '../../js/lib/marked';
import MarkdownIt from 'markdown-it';
import MarkdownItDecorate from 'markdown-it-decorate';
import hljs from 'imports?exports=>undefined!../../js/lib/highlight.pack';
import template from './documents.vdt';
import css from './documents.styl';
import forkMeCss from 'github-fork-ribbon-css/gh-fork-ribbon.css';

var marked = MarkdownIt({
    html: true
}).use(MarkdownItDecorate);

var __TEMPLATE = {};
window.require = function(path) {
    return __TEMPLATE[path];
};

var BLOCK_TYPE = (() => {
    const types = {
        'jsx': 'Vdt',
        'html': 'Vdt',
        'js': 'JavaScript',
        'json': 'JSON',
        'bash': 'Shell'
    };
    return (key) => {
        return types[key] || key;
    }
})();

export default Intact.extend({
    defaults: {
        index: 'getting-started',
        content: ''
    },

    template: template,

    _init: function() {
        var self = this,
            def = $.Deferred();

        // 储存所有的组件，切换文档时，销毁调组件
        this.components = [];
        this.vdts = [];

        // this.on('$changed:content', this._evalScript);

        // App.on('$change:loading', function(app, isLoading) {
            // App.off('$change:loading');
            // App.set('loading', true, {silent: true});
        // });

        return $.ajax({
            url: './docs/' + this.get('index') + '.md', 
            dataType: 'text'
        }).then(function(md) {
            self.set('content', marked.render(md));
        }, function() {
            self.set('content', '<p>To be continued...</p>');
        });
        // return def.promise();
    },

    _mount: function() {
        var self = this;

        var delimiters = Vdt.getDelimiters();
        Vdt.setDelimiters(['{', '}']);
        Vdt.configure({disableSplitText: true});
        eval($(this.element).find('script[type="text/javascript"]').html());

        // 自动运行示例
        var promises = [];
        var $examples = $(this.element).find('.example').not('.silent');
        $examples.each(function() {
            var $this = $(this),
                $template = $this.find('.example-template pre');
            $template.each(function(index, pre) {
                var code = $(pre).text(),
                    template = Vdt.compile(code),
                    matches = code.match(/@file ([^\s]+)/);
                if (matches) {
                    __TEMPLATE[matches[1]]  = template;
                } 
                // 最后一个模板用于渲染
                if (index === $template.length - 1) {
                    var vdt = Vdt(template),
                        data = {},
                        $json = $this.find('.example-js .language-json');
                    if ($json.length) {
                        data = JSON.parse($json.text());
                    }

                    var $result;
                    if ($this.hasClass('dom')) {
                        $result = $this.find('.example-output');
                        if (!$result.length) {
                            $result = $(`<li class="example-output">
                                <div class="block-type">Output</div>
                            </li>`).appendTo($this);
                        }
                        var dom;
                        // 如果找到js，则执行js代码，否则直接渲染
                        var $js = $this.find('.example-js .language-js');
                        var _vdt;
                        if ($js.length) {
                            dom = eval($js.text() + '; _vdt = vdt; vdt.node;');
                        } else {
                            dom = vdt.render(data);
                        }
                        self.vdts.push(_vdt);
                        $result.append(dom);
                    } else {
                        $result = $this.find('.example-result');
                        if (!$result.length) {
                            $result = $(`<li class="example-result">
                                <pre><code class="language-html"></code></pre>
                            </li`).appendTo($this);
                        }

                        var html = vdt.renderString(data);
                        $result.find('code').text(html);
                        self.vdts.push(vdt);
                    }
                }
            });

            // if ($template.length) {
                // var templateStr = $template.text(),
                    // jsStr,
                    // // 是否存在js
                    // $js = $template.parent().next('pre').find('.lang-js');
                // if ($js.length) {
                    // jsStr = $js.text();
                // }
                // promises.push(utils.run(templateStr, this, jsStr, self.components));
            // }

        });

        $(this.element).find('.run').each(function() {
            var $this = $(this),
                js = $this.text(),
                $example = $this.parent().prevAll('.example').not('.silent').first(),
                index = _.findIndex($examples, function(item) {
                    return item === $example[0];
                }),
                vdt = self.vdts[index];
            $('<button>点击运行</button>')
                .insertBefore($this.parent())
                .on('click', function() {
                    eval(js);
                });
        });

        Vdt.setDelimiters(delimiters);

        $(this.element).find('.lang-css').each(function() {
            var css = $(this).text();
            $(this).after('<style>' + css + '</style>');
        });
        $(this.element).find('pre code').each(function(index, item) {
            var className = item.className || '',
                match = /\blang(?:uage)?-([\w-]+)\b/i.exec(className);
            hljs.highlightBlock(item);
            var type = BLOCK_TYPE(match[1]);
            if ($(item).closest('.example-result').length) {
                type = 'Output';
            }
            $(item).parent().append(`<div class="block-type">${type}</div>`);
        });

        // 如果存在anchor，则跳转到相应的地方
        if (this.get('anchor')) {
            Promise.all(promises).then(function() {
                // 找到所有可能的关键词
                var $keywords = $(this.element).find('p > code, h3 > code');
                _.find($keywords, function(item) {
                    var text = $(item).text().replace(/\(.*?\)/g, '');
                    if (text === self.get('anchor')) {
                        $('body').animate({scrollTop: $(item).offset().top});
                        return true;
                    }
                });
            }.bind(this));
        }
    },

    _destroy: function() {
        _.each(this.components, function(component) {
            component.destroy();
        });
    }
});
