'use strict'

const drain = require('psp-drain')

module.exports = reduce

function reduce(reducer, current) {
	let skip = current === undefined
	const drainer = drain(v => {
		if (skip) {
			current = v
			skip = false
		} else {
			current = reducer(current, v)
		}
	})
	const sink = read => drainer(read).then(() => current)
	sink.abort = drainer.abort
	return sink
}
