function foo() {}

const bar = '';
let bork = null;
var snark = 9001;

class Baz {} // It is too difficult to statically analyze all the ways in which
// a symbol could end up on the exports object.
// If exports is present, we should abandon top level optimizations


module.exports;