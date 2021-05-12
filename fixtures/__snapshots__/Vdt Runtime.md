# `Vdt Runtime`

## `Common Element`

####   `render common element`

```
"<div></div>"
```

####   `render common element with children`

```
"<div>1</div>"
```

####   `render dynamic props`

```
"<div id=\"id\"></div>"
```

####   `render class`

```
"<div><div class=\"a\"></div><div class=\"a\"></div></div>"
```

####   `render null and number classname`

```
"<div><div></div><div class=\"1\"></div></div>"
```

####   `render template`

```
"<div>a</div>"
```

####   `render with js`

```
"<div>1</div>"
```

####   `render comment`

```
"<div><!--test--></div>"
```

####   `render script`

```
"<script>var a = 1;</script>"
```

####   `render textarea`

```
"<textarea>&lt;div&gt;1&lt;/div&gt;</textarea>"
```

####   `whitespaces between strings should not be skipped`

```
"<div> aa b <div>c </div></div>"
```

####   `whitespaces between string and expression should not be skipped`

```
"<div> aa a b <div>c</div></div>"
```

####   `whitespaces between expression and element should be skipped`

```
"<div>1 b <div>1 1</div>1</div>"
```

## `Vdt & Block`

####   `render blocks`

```
"<div><div class=\"a\"></div></div>"
```

####   `render block with v-if`

```
"<div></div>"
```

####   `render block with v-for`

```
"<div><div class=\"a\">1</div><div class=\"a\">2</div></div>"
```

####   `render vdt`

```
"<div>1</div>"
```

####   `render vdt call parent`

```
"<div>12</div>"
```

####   `render vdt extends vdt`

```
"<div>ancenstor father child</div>"
```

####   `render block with data`

```
"<ul><li>0: a</li><li>1: b</li></ul>"
```

####   `extend block with data`

```
"<ul><li>0: a a_0</li><li>1: b b_1</li></ul>"
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

####   `render v-if and v-else that there is element between them`

```
"<div><div>true</div><div>middle</div></div>"
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

####   `v-raw`

```
"<div>
    {a}&lt;span&gt;&lt;/span&gt;
</div>"
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
"<div>child</div>"
```

####   `render super`

```
"<div>ab</div>"
```

