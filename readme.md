# Pull stream reduce

A modern version of the
[pull-stream reduce sink](https://pull-stream.github.io/#reduce) which returns a
promise rather than calling a callback.

```
reduce(reducer[, initial])
```

```js
const {pull, values, map} = require('pull-stream')
const reduce = require('psp-reduce')

pull(values([1, 2, 3]), reduce((a, b) => a + b)).then(console.log)
// 6

pull(values([1, 2, 3]), reduce((a, b) => a + b, 10)).then(console.log)
// 16
```

## Abort

Aborting without an error will halt the process and return the value so far.

```
abort([err])
```

```js
const {pull, values} = require('pull-stream')
const reduce = require('psp-reduce')

const sink = reduce((a, b) => a + b, 10)
sink.abort()
pull(values([1, 2, 3]), sink).then(console.log)
// 10
```
