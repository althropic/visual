'use strict';

// Silence dotenv's own console.log output during test runs.
// dotenv@17 logs a startup tip to stdout unconditionally; suppressing it here
// keeps test output clean without patching the dependency itself.
const originalLog = console.log;
console.log = (...args) => {
  if (typeof args[0] === 'string' && args[0].startsWith('[dotenv')) return;
  originalLog(...args);
};
