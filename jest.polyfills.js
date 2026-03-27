// This file runs before the test environment is set up (jest setupFiles).
// Must use require() — runs in Node context before Babel transform.
// Polyfills needed by undici (which is loaded in setupTests.js).
const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream, WritableStream, TransformStream } = require('stream/web')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream
global.WritableStream = WritableStream
global.TransformStream = TransformStream
