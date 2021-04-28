# `Vdt Render`

#### `render common element`

```
"<div></div>"
```

#### `render common element with children`

```
"<div>1</div>"
```

#### `render dynamic props`

```
"<div id=\"id\"></div>"
```

#### `render class`

```
"<div><div class=\"a\"></div><div class=\"a\"></div></div>"
```

#### `render null and number classname`

```
"<div><div></div><div class=\"1\"></div></div>"
```

#### `render blocks`

```
"<div><div class=\"a\"></div></div>"
```

#### `render template`

```
"<div>a</div>"
```

#### `render with js`

```
"<div>1</div>"
```

#### `render comment`

```
"<div><!--test--></div>"
```

## `Directives`

####   `render v-if`

```
"<div>true</div>"
```

####   `render v-if without v-else`

```
""
```

####   `render v-if as children`

```
"<div><div>true</div></div>"
```

####   `render v-for`

```
"<div><div>1</div><div>2</div><div>3</div></div>"
```

####   `render v-for multiple children`

```
"<div><div>0: 1</div><div>0: 1</div><div>1: 2</div><div>1: 2</div><div>2: 3</div><div>2: 3</div></div>"
```

####   `render v-for keyed children`

```
"<div><div>0: 1</div><div>0: 1</div><div>1: 2</div><div>1: 2</div><div>2: 3</div><div>2: 3</div></div>"
```

####   `render v-for object`

```
"<div><div>a: 1</div><div>b: 2</div></div>"
```

####   `v-for empty array`

```
"<div></div>"
```

## `Component`

####   `render class component`

```
"<span></span>"
```

####   `render function component`

```
"<span></span>"
```

####   `render blocks for class component`

```
"<span></span>"
```

