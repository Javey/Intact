# `Generate`

## `Common Element`

####   `should generate common element with string children`

```
"function($props, $blocks) {
    return createElementVNode(2, 'div', 'test', 16, nullnull, "
```

####   `should generate common element with props`

```
"function($props, $blocks) {
    return createElementVNode(2, 'div', 'test'{'id': \"1\"}, 16, null, "
```

####   `should generate common elememt with string className`

```
"function($props, $blocks) {
    return createElementVNode(2, 'div', 'test', 16, null\"a\", "
```

####   `should generate common element with expression className`

```
"function($props, $blocks) {
    return createElementVNode(2, 'div', 'test', 16, null$className(a), "
```

####   `should generate common element with string key and ref`

```
"function($props, $blocks) {
    return createElementVNode(2, 'div', 'test', 16, nullnull, "
```

####   `should generate common elememt with expression key and ref`

```
"function($props, $blocks) {
    return createElementVNode(2, 'div', 'test', 16, nullnull, "
```

