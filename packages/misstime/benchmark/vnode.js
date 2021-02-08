import {Store} from './store.es6';
import {createVNode} from 'inferno';
import {mount} from 'inferno/dist/DOM/mounting';
import {h} from '../index';
import {createElement as r} from '../vdom';

const store = new Store();
store.add();
process.env.NODE_ENV = 'production'; 
suite('test', () => {
    function createRows() {
        var rows = [];
        var data = store.data;
        var selected = store.selected;

        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var id = d.id;

            rows.push(
                createVNode(66, 'tr', id === selected ? 'danger' : '', [
                    createVNode(2, 'td', 'col-md-1', id + ''), 
                    createVNode(2, 'td', 'col-md-4', 
                        createVNode(2, 'a', null, d.label)), 
                    createVNode(2, 'td', 'col-md-1', 
                        createVNode(2, 'a', null, 
                            createVNode(2, 'span', 'glyphicon glyphicon-remove', null, {
                                'aria-hidden': 'true'
                            }))),
                    createVNode(66, 'td', 'col-md-6')
                ])
            );
        }
        return createVNode(2, 'tbody', null, rows);
    }

    function createRowsByMiss() {
        var rows = [];
        var data = store.data;
        var selected = store.selected;

        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var id = d.id;

            rows.push(
                h('tr', null, [
                    h('td', null, id + '', 'col-md-1'), 
                    h('td', null, 
                        h('a', null, d.label)
                    , 'col-md-4'), 
                    h('td', null, 
                        h('a', null,  
                            h('span', 
                                { 
                                    'aria-hidden': 'true'
                                }, null, 'glyphicon glyphicon-remove'
                            )
                        )
                    , 'col-md-1'),
                    h('td', null, null, 'col-md-6')
                ], id === selected ? 'danger' : '')
            );
        }
        return h('tbody', null, rows);
    }

    // benchmark('inferno', () => { 
        // createRows();
    // });

    // benchmark('miss', () => {
        // var a = createRowsByMiss();
    // });

    benchmark('inferno render', () => {
        const vNodes = createRows();
        mount(vNodes, document.createElement('div'));
    });

    benchmark('miss render', () => {
        const vNodes1 = createRowsByMiss();
        r(vNodes1, document.createElement('div'));
    });

    // benchmark('push', () => {
        // var a = [];
        // for (var i = 0; i < 10000; i++) {
            // a.push(i)
        // }
    // });

    // benchmark('concat', () => {
        // var a = [];
        // for (var i = 0; i < 1; i++) {
            // a = a.concat(new Array(10000));
        // }
    // })
});
