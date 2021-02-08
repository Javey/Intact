import _Benchmark from 'benchmark';
import _ from 'lodash';
import process from 'process';
import template from './index.vdt';
import Handlebars from 'handlebars/dist/handlebars';
import Mustache from 'mustache';
import ArtTemplate from './../../js/lib/template-web';
import './index.styl';
import '../documents/documents.styl';
import Highcharts from 'highcharts';

const Benchmark = _Benchmark.runInContext({_, process});
window.Benchmark = Benchmark;

const templates = {
    vdt: `<ul><li v-for={list}>{value}</li></ul>`,
    lodash: `<ul><% _.each(list, function(value) { %><li><%= value %></li><% }) %></ul>`,
    handlebars: `<ul>{{#each list}}<li>{{this}}</li>{{/each}}</ul>`,
    mustache: `<ul>{{#list}}<li>{{.}}</li>{{/list}}</ul>`,
    artTemplate: `<ul>{{each list}}<li>{{$value}}</li>{{/each}}</ul>`,
};

const data = {
    list: ['1', '2', '3', '4', '5']
};

function random() {
    return {
        list: data.list.slice(0).sort(() => {
            return Math.random() > 0.5;
        })
    };
}

export default Intact.extend({
    template,

    defaults() {
        return {
            type: 'update',
            types: {
                render: 'Render(compile every time)',
                update: 'Update(cache compiled template)',
            },
            data: [],
        };
    },

    _init() {
        this.on('$change:data', this._draw);
    },

    _run() {
        this._draw();

        if (this.suite) {
            this.suite.abort();
            this.suite.reset();
        }

        const opera = this.widgets.opera;
        const self = this;
        const options = {
            onStart(e) {
                self.set({
                    title: this.name,
                    results: this.map('name'),
                    fastest: '',
                    error: null,
                    data: [],
                });
            },

            onCycle(e) {
                const info = String(e.target);
                const name = e.target.name;
                const results = self.get('results').slice(0);
                results[results.indexOf(name)] = info;

                const data = self.get('data').slice(0);
                data.push({
                    name: e.target.name,
                    hz: parseInt(e.target.hz),
                });

                self.set({results, data});

                opera.innerHTML = '';
            },

            onError(e) {
                self.set('error', e.target.error.message);
            },

            onComplete(e) {
                const fastest = 'Fastest is ' + this.filter('fastest').map('name');
                self.set('fastest', fastest);
            }
        }

        if (this.get('type') === 'render') {
            this._runRender(options);
        } else {
            this._runUpdate(options);
        }
    },

    _runRender(options) {
        const opera = this.widgets.opera;
        const renderSuite = this.suite = new Benchmark.Suite(this.get('types.render'), options);

        function clear() {
            // force browser to render
            // opera.offsetWidth;
            opera.innerHTML = '';
            // opera.offsetWidth;
        }

        renderSuite
            .add('vdt', () => {
                const vdt = Vdt(templates.vdt);
                const dom = vdt.render(random());
                opera.appendChild(dom);
                clear();
            })
            .add('lodash', () => {
                const template = _.template(templates.lodash);
                const html = template(random());
                opera.innerHTML = html;
                clear();
            })
            .add('handlebars', () => {
                const template = Handlebars.compile(templates.handlebars);
                const html = template(random());
                opera.innerHTML = html;
                clear();
            })
            .add('mustache', () => {
                Mustache.clearCache();
                const html = Mustache.render(templates.mustache, random());
                opera.innerHTML = html;
                clear();
            })
            .add('art-template', () => {
                const template = ArtTemplate.compile(templates.artTemplate);
                const html = template(random());
                opera.innerHTML = html;
                clear();
            })
            .run({async: true})
    },

    _runUpdate(options) {
        const opera = this.widgets.opera;
        Mustache.clearCache();
        const cache = {
            vdt: Vdt(templates.vdt),
            lodash: _.template(templates.lodash),
            handlebars: Handlebars.compile(templates.handlebars),
            mustache: (data) => Mustache.render(templates.mustache, data),
            artTemplate: ArtTemplate.compile(templates.artTemplate),
        };
        const suite = this.suite = new Benchmark.Suite(this.get('types.update'), {
            ...options,
            onStart: function(e) {
                options.onStart.call(this, e);

                const dom = cache.vdt.render(random());
                opera.appendChild(dom);
            },
        });

        suite 
            .add('vdt', () => {
                cache.vdt.update(random());
            })
            .add('lodash', () => {
                opera.innerHTML = cache.lodash(random());
            })
            .add('handlebars', () => {
                opera.innerHTML = cache.handlebars(random());
            })
            .add('mustache', () => {
                opera.innerHTML = cache.mustache(random());
            })
            .add('art-template', () => {
                opera.innerHTML = cache.artTemplate(random());
            })
            .run({async: true})
    },

    _draw() {
        const data = this.get('data');
        const colors = [
            '#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', 
            '#64E572', '#FF9655', '#FFF263', '#6AF9C4'
        ];
        Highcharts.chart('chart', {
            chart: {
                type: 'bar',
            },
            title: {
                text: `${this.get('type')} (ops/sec, high is best)`,
                style: {
                    fontSize: '12px',
                }
            },
            xAxis: {
                categories: _.map(data, 'name'),
            },
            yAxis: {
                min: 0,
                title: {
                    text: null,
                }
            },
            legend: {
                enabled: false,
            },
            series: [
                {
                    name: 'ops/sec',
                    data: _.map(data, (item, index) => {
                        return {
                            y: item.hz,
                            color: colors[index % colors.length],
                        }
                    }),
                }
            ] 
        });
    }
});
