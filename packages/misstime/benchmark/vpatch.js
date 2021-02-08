import {Store} from './store.es6';
import {createVNode} from 'inferno';
import {mount} from 'inferno/dist/DOM/mounting';
import {render} from 'inferno/dist/DOM/rendering';
import {h} from '../index';
import {render as r} from '../vdom';
import {patch as p} from '../vpatch';

const store = new Store();
// store.add(2);
store.runLots();
process.env.NODE_ENV = 'production'; 

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

// function createRowsByMiss() {
    // var rows = [];
    // var data = store.data;
    // var selected = store.selected;

    // for (var i = 0; i < data.length; i++) {
        // var d = data[i];
        // var id = d.id;

        // rows.push(
            // h('tr', {className: id === selected ? 'danger' : ''}, [
                // h('td', {className: 'col-md-1'}, id + ''), 
                // h('td', {className: 'col-md-4'}, 
                    // h('a', null, d.label)
                // ), 
                // h('td', {className: 'col-md-1'}, 
                    // h('a', null,  
                        // h('span', { 
                            // className: 'glyphicon glyphicon-remove',
                            // 'aria-hidden': 'true'
                        // })
                    // )
                // ),
                // h('td', {className: 'col-md-6'})
            // ])
        // );
    // }
    // return h('tbody', null, rows);
// }

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

window.run = function() {
    console.time('a')
    const vNodes1 = createRows();
    const dom = document.createElement('div');
    render(vNodes1, dom);
    store.select(1);
    const vNodes2 = createRows();
    render(vNodes2, dom);
    console.timeEnd('a')
}

window.runMiss = function() {
    console.time('b')
    const vNodes1 = createRowsByMiss();
    const dom = document.createElement('div');
    r(vNodes1, dom);
    store.select(2);
    const vNodes2 = createRowsByMiss();
    p(vNodes1, vNodes2);
    console.timeEnd('b')
}


