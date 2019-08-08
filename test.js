'use strict'

const test = require('tape')
const {pull, values, error} = require('pull-stream')
const reduce = require('./')

test(t => {
	t.plan(3)
	const log = []
	const stream = pull(values([1, 2, 4]), reduce(sumlog(log)))

	t.ok(stream instanceof Promise, '`stream` is a promise')

	stream.then(r => {
		t.equal(r, 7, 'reduced value')
		t.deepEqual(log, [[1, 2], [3, 4]], 'reducing calls')
	})
})

test('with an initial value', t => {
	t.plan(3)
	const log = []
	const stream = pull(values([2, 4]), reduce(sumlog(log), 1))

	t.ok(stream instanceof Promise, '`stream` is a promise')

	stream.then(r => {
		t.equal(r, 7, 'reduced value')
		t.deepEqual(log, [[1, 2], [3, 4]], 'reducing calls')
	})
})

test('reduce a stream which is aborted', t => {
	t.plan(2)
	const log = []
	let count = 0
	const sink = reduce(sumlog(log))
	const stream = pull((end, cb) => {
		if (end) return cb(end)
		count++
		if (count >= 3) sink.abort()
		cb(null, count)
	}, sink)

	stream.then(r => {
		t.equal(r, 3, 'resolved value')
		t.deepEqual(log, [[1, 2]], 'reducing calls')
	})
})

test('reduce a stream which is aborted with an error', t => {
	t.plan(2)
	const testError = new Error('test')
	const log = []
	let count = 0
	const sink = reduce(sumlog(log))
	const stream = pull((end, cb) => {
		if (end) return cb(end)
		count++
		if (count >= 3) sink.abort(testError)
		cb(null, count)
	}, sink)

	stream.catch(err => {
		t.deepEqual(err, testError, 'rejection value')
		t.deepEqual(log, [[1, 2]], 'reducing calls')
	})
})

test('reducing an empty stream', t => {
	t.plan(3)
	const log = []
	const stream = pull(values([]), reduce(sumlog(log)))

	t.ok(stream instanceof Promise, '`stream` is a promise')

	stream.then(r => {
		t.equal(r, undefined, 'reduced value')
		t.deepEqual(log, [], 'reducing calls')
	})
})

test('reducing an empty stream with an initial value', t => {
	t.plan(3)
	const log = []
	const stream = pull(values([]), reduce(sumlog(log), 1))

	t.ok(stream instanceof Promise, '`stream` is a promise')

	stream.then(r => {
		t.equal(r, 1, 'reduced value')
		t.deepEqual(log, [], 'reducing calls')
	})
})

test('reduce a stream with an error in the beginning', t => {
	t.plan(2)
	const testError = new Error('test')
	const log = []
	const stream = pull(error(testError), reduce(sumlog(log)))

	stream.catch(e => {
		t.equal(e, testError, 'Rejects with the error')
		t.deepEqual(log, [], 'reducing calls')
	})
})

test('reduce a stream which errors', t => {
	t.plan(2)
	const testError = new Error('test')
	const log = []
	let count = 0
	const stream = pull((end, cb) => {
		if (end) return cb(end)
		if (count++ < 2) return cb(null, count)
		cb(testError)
	}, reduce(sumlog(log)))

	stream.catch(e => {
		t.equal(e, testError, 'Rejects with the error')
		t.deepEqual(log, [[1, 2]], 'reducing calls')
	})
})

function sumlog(log) {
	return (a, b) => {
		log.push([a, b])
		return a + b
	}
}
