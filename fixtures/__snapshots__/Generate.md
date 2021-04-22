# `Generate`

## `Common Element`

####   `should generate common element without children`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div')
}"
```

####   `should generate common element with string children`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16)
}"
```

####   `should generate common element with props`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16, null, {'id': 1})
}"
```

####   `should generate common elememt with string className`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16, a)
}"
```

####   `should generate common element with expression className`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16, $className(a))
}"
```

####   `should generate common element with string key`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16, null, null, a)
}"
```

####   `should generate common element with expression key`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16, null, null, a)
}"
```

####   `should generate common element with string ref`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16, null, null, null, function(i) {$refs[b] = i})
}"
```

####   `should generate common elememt with expression ref`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 'test', 16, null, null, null, b)
}"
```

####   `should generate common element with element children`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 
        createElementVNode(2, 'div', null, 1, a)
    , 2)
}"
```

####   `should generate common element with multiple element children`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', [
        createElementVNode(2, 'div', null, 1, a),
        createElementVNode(2, 'div')
    ], 4)
}"
```

####   `should generate common element with expression children`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', a, 0)
}"
```

## `Diretives`

####   `should generate v-if`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', [
        a ?
            createElementVNode(2, 'div', 'a', 16) :
            b ?
                createElementVNode(2, 'div', 'b', 16) :
                c ?
                    createElementVNode(2, 'div', 'c', 16) :
                    createElementVNode(2, 'div', 'd', 16)
    ], 4)
}"
```

####   `should generate v-for`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 
        $map(a, function(value, key) {
            return createElementVNode(2, 'div');
        }, $this)
    , 2)
}"
```

####   `should generate v-for-key v-for-value`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 
        $map(a, function(b, a) {
            return createElementVNode(2, 'div');
        }, $this)
    , 2)
}"
```

####   `should genreate v-if and v-for`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', 
        $map(a, function(value, key) {
            return value ?
                createElementVNode(2, 'div') :
                undefined;
        }, $this)
    , 2)
}"
```

## `JS`

####   `should generate js code`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    const a = 1;
    const b = 2;
    return createElementVNode(2, 'div', a, 0)
}"
```

## `Beautify`

####   `should beautify expression`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', () => {
        return 'a'
    }, 0)
}"
```

####   `should beautify expression that has element sibling`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', [
        () => {
            return 'a'
        },
        createElementVNode(2, 'div')
    ], 0)
}"
```

####   `should beautify expression that return element`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    return createElementVNode(2, 'div', () => {
        return createElementVNode(2, 'div')
    }, 0)
}"
```

####   `should beautify js expression code`

```
"function($props, $blocks) {
    $blocks || ($blocks = {});
    $props || ($props = {});

    const a = 1;
    const b = 2;
    return createElementVNode(2, 'div', [
        () => {
            return (
                createElementVNode(2, 'span', [
                    '
                test
                ',
                    () => {
                        return createElementVNode(2, 'i', () => {
                            return 'a'
                        }, 0)
                    }
                ], 0, $className({
                    a: true,
                    b: () => {
                        return 'c'
                    }
                }))
            )
        },
        '
    ',
        createElementVNode(2, 'div', 'test', 16),
        createElementVNode(2, 'div'),
        () => {
            return a;
        },
        createElementVNode(32, 'input')
    ], 0)
}"
```

