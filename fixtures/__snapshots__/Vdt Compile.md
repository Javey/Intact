# `Vdt Compile`

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

## `Component`

####   `without children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;
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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;
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
var _$cc = Vdt.createComponentVNode;
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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'blocks': function($blocks) {
            var _$blocks = {}, __$blocks = _$ex({}, $blocks);
            return (
                (_$blocks['test'] = function(parent) {
                    return (
                        _$cc(A, {
                            'children': 'test'
                        })
                    );
                }),
                (__$blocks['test'] = function() {
                    var args = arguments;
                    var block = $blocks['test'];
                    var callBlock = function() {
                        return _$blocks['test'].apply($this, [_$no].concat(args));
                    };
                    return block ?
                        block.apply($this, [callBlock].concat(args)) :
                        callBlock();
                }),
                __$blocks
            );
        }.call($this, _$em)
    });
};"
```

####   `multiple block children`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createComponentVNode;
var _$ex = Vdt.extend;
var _$em = Vdt.EMPTY_OBJ;
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$cc(Div, {
        'blocks': function($blocks) {
            var _$blocks = {}, __$blocks = _$ex({}, $blocks);
            return (
                (_$blocks['foo'] = function(parent) {
                    return (
                        _$cc(A, {
                            'children': 'test'
                        })
                    );
                }),
                (__$blocks['foo'] = function() {
                    var args = arguments;
                    var block = $blocks['foo'];
                    var callBlock = function() {
                        return _$blocks['foo'].apply($this, [_$no].concat(args));
                    };
                    return block ?
                        block.apply($this, [callBlock].concat(args)) :
                        callBlock();
                }),
                (_$blocks['bar'] = function(parent) {
                    return 'test';
                }),
                (__$blocks['bar'] = function() {
                    var args = arguments;
                    var block = $blocks['bar'];
                    var callBlock = function() {
                        return _$blocks['bar'].apply($this, [_$no].concat(args));
                    };
                    return block ?
                        block.apply($this, [callBlock].concat(args)) :
                        callBlock();
                }),
                __$blocks
            );
        }.call($this, _$em)
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
        (_$blocks['block'] = function(parent) {
            return (
                _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
            );
        }),
        (__$blocks['block'] = function() {
            var args = arguments;
            var block = $blocks['block'];
            var callBlock = function() {
                return _$blocks['block'].apply($this, [_$no].concat(args));
            };
            return block ?
                block.apply($this, [callBlock].concat(args)) :
                callBlock();
        }),
        __$blocks['block']()
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
        (_$blocks['block'] = function(parent, a, b) {
            return (
                _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
            );
        }),
        (__$blocks['block'] = function() {
            var args = arguments;
            var block = $blocks['block'];
            var callBlock = function() {
                return _$blocks['block'].apply($this, [_$no].concat(args));
            };
            return block ?
                block.apply($this, [callBlock].concat(args)) :
                callBlock();
        }),
        __$blocks['block']()
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
        (_$blocks['block'] = function(parent) {
            return (
                _$ce(2, 'div', 'test', 16 /* HasTextChildren */)
            );
        }),
        (__$blocks['block'] = function() {
            var args = arguments;
            var block = $blocks['block'];
            var callBlock = function() {
                return _$blocks['block'].apply($this, [_$no].concat(args));
            };
            return block ?
                block.apply($this, [callBlock].concat(args)) :
                callBlock();
        }),
        __$blocks['block'].apply($this, [a, b])
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
var _$no = Vdt.noop;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return template.call($this, null, function($blocks) {
        var _$blocks = {}, __$blocks = _$ex({}, $blocks);
        return (
            (_$blocks['block'] = function(parent) {
                return 'test';
            }),
            (__$blocks['block'] = function() {
                var args = arguments;
                var block = $blocks['block'];
                var callBlock = function() {
                    return _$blocks['block'].apply($this, [_$no].concat(args));
                };
                return block ?
                    block.apply($this, [callBlock].concat(args)) :
                    callBlock();
            }),
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
var _$no = Vdt.noop;
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
            (_$blocks['block'] = function(parent) {
                return 'test';
            }),
            (__$blocks['block'] = function() {
                var args = arguments;
                var block = $blocks['block'];
                var callBlock = function() {
                    return _$blocks['block'].apply($this, [_$no].concat(args));
                };
                return block ?
                    block.apply($this, [callBlock].concat(args)) :
                    callBlock();
            }),
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
var _$no = Vdt.noop;
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
                (_$blocks['block'] = function(parent) {
                    return 'test';
                }),
                (__$blocks['block'] = function() {
                    var args = arguments;
                    var block = $blocks['block'];
                    var callBlock = function() {
                        return _$blocks['block'].apply($this, [_$no].concat(args));
                    };
                    return block ?
                        block.apply($this, [callBlock].concat(args)) :
                        callBlock();
                }),
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
                    (_$blocks['block'] = function(parent) {
                        return 'test';
                    }),
                    (__$blocks['block'] = function() {
                        var args = arguments;
                        var block = $blocks['block'];
                        var callBlock = function() {
                            return _$blocks['block'].apply($this, [_$no].concat(args));
                        };
                        return block ?
                            block.apply($this, [callBlock].concat(args)) :
                            callBlock();
                    }),
                    __$blocks['block']()
                ), 0 /* UnknownChildren */)
            )
        }, null)
    ), 0 /* UnknownChildren */);
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
            return value ?
                _$ce(2, 'div') :
                undefined;
        }, $this)
    ), 0 /* UnknownChildren */);
};"
```

##   `v-model`

####     `radio without value`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$sm = Vdt.setModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'type': 'radio', 
        '$model:value': 'propName', 
        'checked': $this.get('propName') === 'on', 
        'ev-$model:change': _$le($this, _$sm)
    });
};"
```

####     `radio with value`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$sm = Vdt.setModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(64, 'input', null, 1 /* HasInvalidChildren */, null, {
        'value': 'test', 
        'type': 'radio', 
        '$model:value': 'propName', 
        'checked': $this.get('propName') === 'test', 
        'ev-$model:change': _$le($this, _$sm)
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
var _$sm = Vdt.setModel;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(256, 'textarea', null, 1 /* HasInvalidChildren */, null, {
        '$model:value': 'propName', 
        'ev-$model:input': _$le($this, _$sm), 
        'value': $this.get('propName')
    });
};"
```

####     `component`

```
"var Vdt = _$vdt;
var _$cc = Vdt.createComponentVNode;

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
var _$cc = Vdt.createComponentVNode;

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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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
        _$ma(a, function(value, key) {
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

####     `component child`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cc = Vdt.createComponentVNode;

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
        (_$blocks['block'] = function(parent) {
            return 'test';
        }),
        (__$blocks['block'] = function() {
            var args = arguments;
            var block = $blocks['block'];
            var callBlock = function() {
                return _$blocks['block'].apply($this, [_$no].concat(args));
            };
            return block ?
                block.apply($this, [callBlock].concat(args)) :
                callBlock();
        }),
        __$blocks['block']()
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

####     `keyed children`

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

####     `non-keyed children`

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

## `Extract Props`

####   `should extract props if has not dynamic prop`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$cc = Vdt.createComponentVNode;
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
    ], 0 /* UnknownChildren */);
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
    ], 0 /* UnknownChildren */);
};"
```

####   `should not extract props if has v-model`

```
"var Vdt = _$vdt;
var _$ce = Vdt.createElementVNode;
var _$le = Vdt.linkEvent;
var _$sm = Vdt.setModel;
var _$cc = Vdt.createComponentVNode;

return function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});
    var $this = this;
    
    return _$ce(2, 'div', [
        _$ce(64, 'input', null, 1 /* HasInvalidChildren */, 'c', {
            'a': '1', 
            'b': true, 
            '$model:value': 'a', 
            'ev-$model:change': _$le($this, _$sm), 
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
var _$cc = Vdt.createComponentVNode;
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
            (_$blocks['block'] = function(parent) {
                return null;
            }),
            (__$blocks['block'] = function() {
                var args = arguments;
                var block = $blocks['block'];
                var callBlock = function() {
                    return _$blocks['block'].apply($this, [_$no].concat(args));
                };
                return block ?
                    block.apply($this, [callBlock].concat(args)) :
                    callBlock();
            }),
            __$blocks['block']()
        ), 0 /* UnknownChildren */, null, _$tmp0),
        _$cc(Div, {
            'a': '1', 
            'blocks': function($blocks) {
                var _$blocks = {}, __$blocks = _$ex({}, $blocks);
                return (
                    (_$blocks['block'] = function(parent) {
                        return null;
                    }),
                    (__$blocks['block'] = function() {
                        var args = arguments;
                        var block = $blocks['block'];
                        var callBlock = function() {
                            return _$blocks['block'].apply($this, [_$no].concat(args));
                        };
                        return block ?
                            block.apply($this, [callBlock].concat(args)) :
                            callBlock();
                    }),
                    __$blocks
                );
            }.call($this, _$em)
        })
    ], 4 /* HasNonKeyedChildren */);
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

