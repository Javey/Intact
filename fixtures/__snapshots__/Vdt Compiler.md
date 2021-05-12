# `Vdt Compiler`

## `Common Element`

####   `without children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div');
};"
```

####   `string children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */);
};"
```

####   `props`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$tmp0 = {
    'id': '1'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */, null, _$tmp0);
};"
```

####   `string className`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */, 'a');
};"
```

####   `expression className`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cn = Vdt.className;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */, _$cn(a));
};"
```

####   `string key`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */, null, null, 'a');
};"
```

####   `expression key`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */, null, null, a);
};"
```

####   `string ref`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$refs = this.refs;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */, null, null, null, function(i) {_$refs['b'] = i});
};"
```

####   `expression ref`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'test', 16 /* HasTextChildren */, null, null, null, b);
};"
```

####   `element children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, 'a')
    ), 2 /* HasVNodeChildren */);
};"
```

####   `multiple element children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, 'a'),
        _$ce(2, 'div')
    ], 4 /* HasNonKeyedChildren */);
};"
```

####   `expression children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', a, 0 /* UnknownChildren */);
};"
```

####   `comment children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ccv = Vdt.createCommentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', _$ccv('test'), 2 /* HasVNodeChildren */);
};"
```

####   `unescape text children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cu = Vdt.createUnescapeTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', _$cu(test), 2 /* HasVNodeChildren */);
};"
```

####   `expression attribute`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, {
        ...a,
        'a': '1'
    });
};"
```

####   `ignore empty expression attribute`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, {
        ...a,
        'a': '1'
    });
};"
```

####   `empty expression as attribute value`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$tmp0 = {
    'a': null
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp0);
};"
```

####   `empty expresion as child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ct = Vdt.createTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        null,
        _$ct('test')
    ], 0 /* UnknownChildren */);
};"
```

####   `text tag`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(256, 'textarea', null, 1 /* HasInvalidChildren */, null, {
        'value': '<div>' + 'a' + '</div>'
    });
};"
```

####   `redundant } in child should be parsed correctly`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ct = Vdt.createTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        a,
        _$ct('}')
    ], 0 /* UnknownChildren */);
};"
```

####   `delimiters: ["{{", "}}"]`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cn = Vdt.className;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', a, 0 /* UnknownChildren */, _$cn(className), {
        'style': {width: '100px'}
    });
};"
```

## `Special String-like Code`

####   `breakline string`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const a = `a
b`;
    const b = null;
    return _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, {
        'a': 'a\\n    b',
        'b': `a
        b`
    });
};"
```

####   `should not check tag closing in string`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const a = '<div>';
    return _$ce(2, 'div');
};"
```

####   `escape quote`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$tmp0 = {
    'a': 'a\\'a',
    'b': 'a\\'a'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        'a\\'a',
        \"a'a\"
    ], 0 /* UnknownChildren */, null, _$tmp0);
};"
```

####   `breakline comment and tag in comment`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ccv = Vdt.createCommentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', _$ccv('\\n        <div>\\n    '), 2 /* HasVNodeChildren */);
};"
```

####   `regexp`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const a = /<div>/
    return _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, {
        'validate': /\"<'/
    });
};"
```

####   `slash / as division sign`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    /te'st/
    var a = /*test*/ /*test*/ /te'st/;
    (function() { return 1;  }) / 2;
    return _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, {
        'width': 100 / 10
    });
};"
```

####   `js single line comment`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const a = /<div>/ // <div>
    return _$ce(2, 'div');
};"
```

####   `js multiple lines comment`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    /* 
 * <div>
 */ 
    const a = /<div>/
    return _$ce(2, 'div');
};"
```

####   `< in as text node`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'a < b ? a : b; a <2? a : b', 16 /* HasTextChildren */);
};"
```

## `Component`

####   `without children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div);
};"
```

####   `string children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'children': 'test'
    });
};"
```

####   `props`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'id': '1',
        'children': 'test'
    });
};"
```

####   `string className`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'className': 'a',
        'children': 'test'
    });
};"
```

####   `expression className`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;
var _$cn = Vdt.className;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'className': _$cn(a),
        'children': 'test'
    });
};"
```

####   `string key`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'key': 'a',
        'children': 'test'
    }, 'a');
};"
```

####   `expression key`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'key': a,
        'children': 'test'
    }, a);
};"
```

####   `string ref`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$refs = this.refs;
    var _$ref_b = function(i) {_$refs['b'] = i};
    
    return _$cc(Div, {
        'ref': _$ref_b,
        'children': 'test'
    }, null, _$ref_b);
};"
```

####   `expression ref`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'ref': b,
        'children': 'test'
    }, null, b);
};"
```

####   `element children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'children': (
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, 'a')
        )
    });
};"
```

####   `multiple element children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'children': [
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, 'a'),
            _$ce(2, 'div')
        ]
    });
};"
```

####   `expression children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'children': a
    });
};"
```

####   `component children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'children': (
            _$cc(Span)
        )
    });
};"
```

####   `block children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        '$blocks': function($blocks) {
            var _$blocks = {}, __$blocks = _$ex({}, $blocks);
            return (
                (
                    (_$blocks['test'] = function($super) {
                        return (
                            _$cc(A, {
                                'children': 'test'
                            })
                        );
                    }),
                    (__$blocks['test'] = function($super, data) {
                        var block = $blocks['test'];
                        var callBlock = function() {
                            return _$blocks['test'].call($this, $super, data);
                        };
                        return block ?
                            block.call($this, callBlock, data) :
                            callBlock();
                    })
                ),
                __$blocks
            );
        }.call($this, _$em)
    });
};"
```

####   `multiple block children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        '$blocks': function($blocks) {
            var _$blocks = {}, __$blocks = _$ex({}, $blocks);
            return (
                (
                    (_$blocks['foo'] = function($super) {
                        return (
                            _$cc(A, {
                                'children': 'test'
                            })
                        );
                    }),
                    (__$blocks['foo'] = function($super, data) {
                        var block = $blocks['foo'];
                        var callBlock = function() {
                            return _$blocks['foo'].call($this, $super, data);
                        };
                        return block ?
                            block.call($this, callBlock, data) :
                            callBlock();
                    })
                ),
                (
                    (_$blocks['bar'] = function($super) {
                        return 'test';
                    }),
                    (__$blocks['bar'] = function($super, data) {
                        var block = $blocks['bar'];
                        var callBlock = function() {
                            return _$blocks['bar'].call($this, $super, data);
                        };
                        return block ?
                            block.call($this, callBlock, data) :
                            callBlock();
                    })
                ),
                __$blocks
            );
        }.call($this, _$em)
    });
};"
```

####   `Transition & TransitionGroup`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(TransitionGroup, {
        'children': (
            _$cc(Transition, {
                'children': (
                    _$ce(2, 'div', '1', 16 /* HasTextChildren */)
                )
            })
        )
    });
};"
```

## `Block`

####   `without args and params`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', (
        (
            (_$blocks['block'] = function($super) {
                return (
                    _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
                );
            }),
            (__$blocks['block'] = function($super, data) {
                var block = $blocks['block'];
                var callBlock = function() {
                    return _$blocks['block'].call($this, $super, data);
                };
                return block ?
                    block.call($this, callBlock, data) :
                    callBlock();
            }),
            __$blocks['block'](_$no)
        )
    ), 0 /* UnknownChildren */);
};"
```

####   `with args`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', (
        (
            (_$blocks['block'] = function($super, a, b) {
                return (
                    _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
                );
            }),
            (__$blocks['block'] = function($super, data) {
                var block = $blocks['block'];
                var callBlock = function() {
                    return _$blocks['block'].call($this, $super, data);
                };
                return block ?
                    block.call($this, callBlock, data) :
                    callBlock();
            }),
            __$blocks['block'](_$no)
        )
    ), 0 /* UnknownChildren */);
};"
```

####   `with params`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', (
        (
            (_$blocks['block'] = function($super) {
                return (
                    _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
                );
            }),
            (__$blocks['block'] = function($super, data) {
                var block = $blocks['block'];
                var callBlock = function() {
                    return _$blocks['block'].call($this, $super, data);
                };
                return block ?
                    block.call($this, callBlock, data) :
                    callBlock();
            }),
            __$blocks['block'](_$no, [a, b])
        )
    ), 0 /* UnknownChildren */);
};"
```

####   `with directive if`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', (
        a ?
            (
                (_$blocks['block'] = function($super) {
                    return (
                        _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
                    );
                }),
                (__$blocks['block'] = function($super, data) {
                    var block = $blocks['block'];
                    var callBlock = function() {
                        return _$blocks['block'].call($this, $super, data);
                    };
                    return block ?
                        block.call($this, callBlock, data) :
                        callBlock();
                }),
                __$blocks['block'](_$no, [a, b])
            ) :
            undefined
    ), 0 /* UnknownChildren */);
};"
```

####   `with directive for`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return (
                (_$blocks['block'] = function($super) {
                    return (
                        _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
                    );
                }),
                (__$blocks['block'] = function($super, data) {
                    var block = $blocks['block'];
                    var callBlock = function() {
                        return _$blocks['block'].call($this, $super, data);
                    };
                    return block ?
                        block.call($this, callBlock, data) :
                        callBlock();
                }),
                __$blocks['block'](_$no, [a, b])
            );
        }, $this)
    ), 0 /* UnknownChildren */);
};"
```

## `Vdt`

####   `without block children`

```
"var Vdt = _$vdt;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return template.call($this, null, $blocks);
};"
```

####   `with block children`

```
"var Vdt = _$vdt;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return template.call($this, null, function($blocks) {
        var _$blocks = {}, __$blocks = _$ex({}, $blocks);
        return (
            (
                (_$blocks['block'] = function($super) {
                    return 'test';
                }),
                (__$blocks['block'] = function($super, data) {
                    var block = $blocks['block'];
                    var callBlock = function() {
                        return _$blocks['block'].call($this, $super, data);
                    };
                    return block ?
                        block.call($this, callBlock, data) :
                        callBlock();
                })
            ),
            __$blocks
        );
    }.call($this, $blocks));
};"
```

####   `with props`

```
"var Vdt = _$vdt;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;
var _$tmp0 = {
    'className': 'a'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return template.call($this, _$tmp0, function($blocks) {
        var _$blocks = {}, __$blocks = _$ex({}, $blocks);
        return (
            (
                (_$blocks['block'] = function($super) {
                    return 'test';
                }),
                (__$blocks['block'] = function($super, data) {
                    var block = $blocks['block'];
                    var callBlock = function() {
                        return _$blocks['block'].call($this, $super, data);
                    };
                    return block ?
                        block.call($this, callBlock, data) :
                        callBlock();
                })
            ),
            __$blocks
        );
    }.call($this, $blocks));
};"
```

####   `as children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;
var _$tmp0 = {
    'className': 'a'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        template.call($this, _$tmp0, function($blocks) {
            var _$blocks = {}, __$blocks = _$ex({}, $blocks);
            return (
                (
                    (_$blocks['block'] = function($super) {
                        return 'test';
                    }),
                    (__$blocks['block'] = function($super, data) {
                        var block = $blocks['block'];
                        var callBlock = function() {
                            return _$blocks['block'].call($this, $super, data);
                        };
                        return block ?
                            block.call($this, callBlock, data) :
                            callBlock();
                    })
                ),
                __$blocks
            );
        }.call($this, _$em))
    ), 0 /* UnknownChildren */);
};"
```

####   `as children and define block`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', (
        template.call($this, {
            'className': 'a',
            'children': (
                _$ce(2, 'div', (
                    (
                        (_$blocks['block'] = function($super) {
                            return 'test';
                        }),
                        (__$blocks['block'] = function($super, data) {
                            var block = $blocks['block'];
                            var callBlock = function() {
                                return _$blocks['block'].call($this, $super, data);
                            };
                            return block ?
                                block.call($this, callBlock, data) :
                                callBlock();
                        }),
                        __$blocks['block'](_$no)
                    )
                ), 0 /* UnknownChildren */)
            )
        }, null)
    ), 0 /* UnknownChildren */);
};"
```

####   `super`

```
"var Vdt = _$vdt;
var _$su = Vdt.superCall;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;
var _$tmp0 = {
    'className': 'a'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$su.call($this, _$tmp0, function($blocks) {
        var _$blocks = {}, __$blocks = _$ex({}, $blocks);
        return (
            (
                (_$blocks['block'] = function($super) {
                    return 'test';
                }),
                (__$blocks['block'] = function($super, data) {
                    var block = $blocks['block'];
                    var callBlock = function() {
                        return _$blocks['block'].call($this, $super, data);
                    };
                    return block ?
                        block.call($this, callBlock, data) :
                        callBlock();
                })
            ),
            __$blocks
        );
    }.call($this, $blocks));
};"
```

## `Diretives`

####   `v-if`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        a ?
            _$ce(2, 'div', 'a', 16 /* HasTextChildren */) :
            b ?
                _$ce(2, 'div', 'b', 16 /* HasTextChildren */) :
                c ?
                    _$ce(2, 'div', 'c', 16 /* HasTextChildren */) :
                    _$ce(2, 'div', 'd', 16 /* HasTextChildren */)
    ), 2 /* HasVNodeChildren */);
};"
```

####   `v-for`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return _$ce(2, 'div');
        }, $this)
    ), 4 /* HasNonKeyedChildren */);
};"
```

####   `v-for-key v-for-value`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function(b, a) {
            return _$ce(2, 'div');
        }, $this)
    ), 4 /* HasNonKeyedChildren */);
};"
```

####   `v-if and v-for`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return value ?
                _$ce(2, 'div') :
                undefined;
        }, $this)
    ), 0 /* UnknownChildren */);
};"
```

####   `v-raw`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', '\\n    {a}<span></span>\\n', 16 /* HasTextChildren */);
};"
```

##   `v-model`

####     `radio without value`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$srm = Vdt.setRadioModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'type': 'radio',
        '$model:value': 'propName',
        'checked': $this.get('propName') === 'on',
        'ev-$model:change': _$le($this, _$srm)
    });
};"
```

####     `radio with value`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$srm = Vdt.setRadioModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'value': 'test',
        'type': 'radio',
        '$model:value': 'propName',
        'checked': $this.get('propName') === 'test',
        'ev-$model:change': _$le($this, _$srm)
    });
};"
```

####     `checkbox without trueValue and falseValue`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$isc = Vdt.isChecked;
var _$le = Vdt.linkEvent;
var _$scm = Vdt.setCheckboxModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'type': 'checkbox',
        '$model:value': 'propName',
        'checked': _$isc($this.get('propName'), true),
        'ev-$model:change': _$le($this, _$scm)
    });
};"
```

####     `checkbox with trueValue`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$isc = Vdt.isChecked;
var _$le = Vdt.linkEvent;
var _$scm = Vdt.setCheckboxModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'trueValue': '1',
        'type': 'checkbox',
        '$model:value': 'propName',
        'checked': _$isc($this.get('propName'), '1'),
        'ev-$model:change': _$le($this, _$scm)
    });
};"
```

####     `checkbox with trueValue and falseValue`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$isc = Vdt.isChecked;
var _$le = Vdt.linkEvent;
var _$scm = Vdt.setCheckboxModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'trueValue': '1',
        'type': 'checkbox',
        'falseValue': '2',
        '$model:value': 'propName',
        'checked': _$isc($this.get('propName'), '1'),
        'ev-$model:change': _$le($this, _$scm)
    });
};"
```

####     `select`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$ssm = Vdt.setSelectModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(128, 'select', null, 1 /* HasInvalidChildren */, null, {
        '$model:value': 'propName',
        'ev-$model:change': _$le($this, _$ssm),
        'value': $this.get('propName')
    });
};"
```

####     `textarea`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$stm = Vdt.setTextModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(256, 'textarea', null, 1 /* HasInvalidChildren */, null, {
        '$model:value': 'propName',
        'ev-$model:input': _$le($this, _$stm),
        'value': $this.get('propName')
    });
};"
```

####     `component`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Component, {
        'ev-$model:value': function($v) {
            $this.set('propName', $v);
        },
        'value': $this.get('propName')
    });
};"
```

####     `component with multipe v-model`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Component, {
        'ev-$model:value': function($v) {
            $this.set('propName', $v);
        },
        'value': $this.get('propName'),
        'ev-$model:name': function($v) {
            $this.set('myName', $v);
        },
        'name': $this.get('myName')
    });
};"
```

####     `number type`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$stm = Vdt.setTextModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'type': 'number',
        '$model:value': 'propName',
        'ev-$model:input': _$le($this, _$stm),
        'value': $this.get('propName')
    });
};"
```

####     `without type`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$stm = Vdt.setTextModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        '$model:value': 'propName',
        'ev-$model:input': _$le($this, _$stm),
        'value': $this.get('propName')
    });
};"
```

## `JS`

####   `js code`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const a = 1;
    const b = 2;
    return _$ce(2, 'div', a, 0 /* UnknownChildren */);
};"
```

## `Hoist`

####   `import`

```
"import {name} from 'xxxx';
import a from 'xxxx'

import x from 'x';
var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const b = a;
    return _$ce(2, 'div', b, 0 /* UnknownChildren */);
};"
```

## `ChildrenType`

##   `v-if`

####     `v-if has not v-else`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        a ?
            _$ce(2, 'div') :
            undefined
    ), 0 /* UnknownChildren */);
};"
```

####     `v-if has v-else`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        a ?
            _$ce(2, 'div') :
            _$ce(2, 'span')
    ), 2 /* HasVNodeChildren */);
};"
```

####     `v-if invalid element`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div');
};"
```

####     `v-if text element`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        a ?
            'a' :
            'b'
    ), 16 /* HasTextChildren */);
};"
```

####     `v-if with expression element`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        a ?
            a :
            'b'
    ), 0 /* UnknownChildren */);
};"
```

####     `v-if with single vNode and multiple vNodes`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        a ?
            _$ce(2, 'div', a, 0 /* UnknownChildren */) :
            [
                _$ce(2, 'div'),
                _$ce(2, 'div')
            ]
    ), 0 /* UnknownChildren */);
};"
```

####     `v-if with keyed multiple vNodes and non-keyed multiple vNdoes`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        a ?
            [
                _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
                _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'b')
            ] :
            [
                _$ce(2, 'div'),
                _$ce(2, 'div')
            ]
    ), 0 /* UnknownChildren */);
};"
```

##   `v-for`

####     `v-for keyed vNode`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return _$ce(2, 'div', a, 0 /* UnknownChildren */, null, null, value);
        }, $this)
    ), 8 /* HasKeyedChildren */);
};"
```

####     `v-for non-keyed vNode`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return _$ce(2, 'div', a, 0 /* UnknownChildren */);
        }, $this)
    ), 4 /* HasNonKeyedChildren */);
};"
```

####     `v-for multiple keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return [
                _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
                _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'b')
            ];
        }, $this)
    ), 8 /* HasKeyedChildren */);
};"
```

####     `v-for multiple non-keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return [
                _$ce(2, 'div'),
                _$ce(2, 'div')
            ];
        }, $this)
    ), 4 /* HasNonKeyedChildren */);
};"
```

####     `v-for with multiple non-keyed and keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return [
                _$ce(2, 'div'),
                _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'b')
            ];
        }, $this)
    ), 0 /* UnknownChildren */);
};"
```

####     `v-for with non-keyed v-if without v-else`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return a ?
                _$ce(2, 'div') :
                undefined;
        }, $this)
    ), 0 /* UnknownChildren */);
};"
```

####     `v-for with non-keyed v-if with v-else in template`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return (
                a ?
                    _$ce(2, 'div') :
                    _$ce(2, 'div')
            );
        }, $this)
    ), 4 /* HasNonKeyedChildren */);
};"
```

####     `v-for with keyed v-if with v-else in template`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return (
                a ?
                    _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a') :
                    _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
            );
        }, $this)
    ), 8 /* HasKeyedChildren */);
};"
```

####     `v-for text`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;
var _$ct = Vdt.createTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return _$ct('\\n        a\\n    ');
        }, $this)
    ), 4 /* HasNonKeyedChildren */);
};"
```

####     `v-for text with keyed element`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;
var _$ct = Vdt.createTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return [
                _$ct('\\n        a\\n        '),
                _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
            ];
        }, $this)
    ), 0 /* UnknownChildren */);
};"
```

####     `v-for nested template text`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ma = Vdt.map;
var _$ct = Vdt.createTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ma(a, function($value, $key) {
            return (
                _$ct('a')
            );
        }, $this)
    ), 4 /* HasNonKeyedChildren */);
};"
```

##   `Single Child`

####     `expression child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', a, 0 /* UnknownChildren */);
};"
```

####     `text child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', 'a', 16 /* HasTextChildren */);
};"
```

####     `element child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ce(2, 'div')
    ), 2 /* HasVNodeChildren */);
};"
```

####     `keyed element child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
    ), 2 /* HasVNodeChildren */);
};"
```

####     `component child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        _$cc(Div)
    ), 2 /* HasVNodeChildren */);
};"
```

####     `comment child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ccv = Vdt.createCommentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', _$ccv(''), 2 /* HasVNodeChildren */);
};"
```

####     `unescape text child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cu = Vdt.createUnescapeTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', _$cu(a), 2 /* HasVNodeChildren */);
};"
```

####     `block child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', (
        (
            (_$blocks['block'] = function($super) {
                return 'test';
            }),
            (__$blocks['block'] = function($super, data) {
                var block = $blocks['block'];
                var callBlock = function() {
                    return _$blocks['block'].call($this, $super, data);
                };
                return block ?
                    block.call($this, callBlock, data) :
                    callBlock();
            }),
            __$blocks['block'](_$no)
        )
    ), 0 /* UnknownChildren */);
};"
```

####     `vdt child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        vdt.call($this, null, null)
    ), 0 /* UnknownChildren */);
};"
```

####     `template text child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        'a'
    ), 16 /* HasTextChildren */);
};"
```

##   `Multiple Children`

####     `two keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'b')
    ], 8 /* HasKeyedChildren */);
};"
```

####     `more than two keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'b'),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'c')
    ], 8 /* HasKeyedChildren */);
};"
```

####     `two non-keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div'),
        _$ce(2, 'div')
    ], 4 /* HasNonKeyedChildren */);
};"
```

####     `more than two non-keyed elements`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div'),
        _$ce(2, 'div'),
        _$ce(2, 'div')
    ], 4 /* HasNonKeyedChildren */);
};"
```

####     `keyed and non-keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
        _$ce(2, 'div')
    ], 0 /* UnknownChildren */);
};"
```

####     `non-keyed template children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        [
            _$ce(2, 'div'),
            _$ce(2, 'div')
        ]
    ), 4 /* HasNonKeyedChildren */);
};"
```

####     `keyed template children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', (
        [
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
        ]
    ), 8 /* HasKeyedChildren */);
};"
```

####     `non-keyed template with keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        [
            _$ce(2, 'div'),
            _$ce(2, 'div')
        ],
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
    ], 0 /* UnknownChildren */);
};"
```

####     `keyed template with keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        [
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
        ],
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
    ], 0 /* UnknownChildren */);
};"
```

####     `expression children with keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        a,
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
    ], 0 /* UnknownChildren */);
};"
```

####     `multiple text children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ct = Vdt.createTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ct('a'),
        _$ct('b')
    ], 4 /* HasNonKeyedChildren */);
};"
```

####     `text children with keyed children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ct = Vdt.createTextVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ct('\\n    a\\n    '),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a')
    ], 0 /* UnknownChildren */);
};"
```

####     `keyed v-if with keyed element children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        a ?
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a') :
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a'),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'b')
    ], 8 /* HasKeyedChildren */);
};"
```

####     `non-keyed v-if with keyed element children`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        a ?
            _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'a') :
            _$ce(2, 'div'),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, null, 'b')
    ], 0 /* UnknownChildren */);
};"
```

## `Extract Props`

####   `should extract props if has not dynamic prop`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cc = Vdt.createUnknownComponentVNode;
var _$tmp0 = {
    'a': '1',
    'b': true
};
var _$tmp1 = {
    'a': '1',
    'b': true
};
var _$tmp2 = {
    'a': '1'
};
var _$tmp3 = {
    'a': '1'
};
var _$tmp4 = {
    'a': '1',
    'b': true,
    'className': 'c'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div', 'a', 16 /* HasTextChildren */, 'c', _$tmp0),
        _$ce(2, 'div', 'a', 16 /* HasTextChildren */, null, _$tmp1),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp2),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, 'c', _$tmp3),
        _$cc(Div, _$tmp4)
    ], 4 /* HasNonKeyedChildren */);
};"
```

####   `should extract props which value is primitive value`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$tmp0 = {
    'a': 1
};
var _$tmp1 = {
    'a': 111
};
var _$tmp2 = {
    'a': true
};
var _$tmp3 = {
    'a': false
};
var _$tmp4 = {
    'a': null
};
var _$tmp5 = {
    'a': undefined
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp0),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp1),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp2),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp3),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp4),
        _$ce(2, 'div', null, 1 /* HasInvalidChildren */, null, _$tmp5)
    ], 4 /* HasNonKeyedChildren */);
};"
```

####   `should not extract props if has v-model`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$stm = Vdt.setTextModel;
var _$cc = Vdt.createUnknownComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(64, 'input', null, 1 /* HasInvalidChildren */, 'c', {
            'a': '1',
            'b': true,
            '$model:value': 'a',
            'ev-$model:input': _$le($this, _$stm),
            'value': $this.get('a')
        }),
        _$cc(Div, {
            'a': '1',
            'b': true,
            'className': 'c',
            'ev-$model:value': function($v) {
                $this.set('a', $v);
            },
            'value': $this.get('a')
        })
    ], 4 /* HasNonKeyedChildren */);
};"
```

####   `should not extract props if has blocks`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$no = Vdt.noop;
var _$cc = Vdt.createUnknownComponentVNode;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;
var _$tmp0 = {
    'a': '1'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    var _$blocks = {};
    var __$blocks = {};
    
    return _$ce(2, 'div', [
        _$ce(2, 'div', (
            (
                (_$blocks['block'] = function($super) {
                    return null;
                }),
                (__$blocks['block'] = function($super, data) {
                    var block = $blocks['block'];
                    var callBlock = function() {
                        return _$blocks['block'].call($this, $super, data);
                    };
                    return block ?
                        block.call($this, callBlock, data) :
                        callBlock();
                }),
                __$blocks['block'](_$no)
            )
        ), 0 /* UnknownChildren */, null, _$tmp0),
        _$cc(Div, {
            'a': '1',
            '$blocks': function($blocks) {
                var _$blocks = {}, __$blocks = _$ex({}, $blocks);
                return (
                    (
                        (_$blocks['block'] = function($super) {
                            return null;
                        }),
                        (__$blocks['block'] = function($super, data) {
                            var block = $blocks['block'];
                            var callBlock = function() {
                                return _$blocks['block'].call($this, $super, data);
                            };
                            return block ?
                                block.call($this, callBlock, data) :
                                callBlock();
                        })
                    ),
                    __$blocks
                );
            }.call($this, _$em)
        })
    ], 4 /* HasNonKeyedChildren */);
};"
```

####   `should extract props if text tag has not expression`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$tmp0 = {
    'value': '<div>aaa</div>'
};

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(256, 'textarea', null, 1 /* HasInvalidChildren */, null, _$tmp0);
};"
```

## `ESM`

####   `should compile to esm code`

```
"import {
    createUnknownComponentVNode as _$cc,
    createElementVNode as _$ce,
} from 'vdt/runtime';
import a from 'b';

export default function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const a = 1;
    return _$cc(Div, {
        'a': '1',
        'children': (
            _$ce(2, 'div', a, 0 /* UnknownChildren */)
        )
    });
};"
```

## `Beautify`

####   `expression`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', () => {
        return 'a'
    }, 0 /* UnknownChildren */);
};"
```

####   `expression that has element sibling`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        () => {
            return 'a'
        },
        _$ce(2, 'div')
    ], 0 /* UnknownChildren */);
};"
```

####   `expression that return element`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', () => {
        return _$ce(2, 'div')
    }, 0 /* UnknownChildren */);
};"
```

####   `js expression code`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$ct = Vdt.createTextVNode;
var _$cn = Vdt.className;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    const a = 1;
    const b = 2;
    return _$ce(2, 'div', [
        () => {
            return (
                _$ce(2, 'span', [
                    _$ct('\\n                test\\n                '),
                    () => {
                        return _$ce(2, 'i', () => {
                            return 'a'
                        }, 0 /* UnknownChildren */)
                    }
                ], 0 /* UnknownChildren */, _$cn({
                    a: true,
                    b: () => {
                        return 'c'
                    }
                }))
            )
        },
        _$ct('\\n    '),
        _$ce(2, 'div', 'test', 16 /* HasTextChildren */),
        _$ce(2, 'div'),
        () => {
            return a;
        },
        _$ce(64, 'input')
    ], 0 /* UnknownChildren */);
};"
```

