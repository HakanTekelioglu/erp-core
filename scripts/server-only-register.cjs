// Next resolves server-only internally; standalone service benchmarks use its empty server entry.
const Module = require('node:module');
const original = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return original.call(this, request === 'server-only' ? 'next/dist/compiled/server-only/empty' : request, ...args);
};
