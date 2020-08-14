function a() {}

function c() {}

function noReturnIf() {
  var c = b();
  return c;
}

function noReturnElse() {
  var c = b();
  return c;
}

function removeSubsequentIf() {
  // remove if's subsequent siblings
  return 1;
}

function removeSubsequentElse() {
  // remove else's subsequent siblings
  return 1;
}

function g() {
  // preserve function
  g.func = function () {};

  return 1;
}

var variableToBeUsed = 1;

function h() {
  // leave used variables
  h.variableToBeUsed = void 0;
  return 1;
}

function blockLocalIf() {
  // preserve block-local function declared inside „consequent” block
  foo.a = 1;
  {
    a();
    return a;

    function a() {}
  }
}

function blockLocalElse() {
  // preserve block-local function declared inside „alternate” block
  foo.a = 1;
  {
    a();
    return a;

    function a() {}
  }
}

function i() {
  _i += ' ' + void 0 + void 0 + void 0 + void 0 + void 0 + void 0;
}

function j() {
  _i += ' ' + void 0 + void 0 + void 0 + void 0 + void 0 + void 0;
}

function k() {
  function s() {
    s.func = func;
    s._s = void 0;
    s._ss = 3;
    return 1;
    var v;

    function func() {
      v = (v | 0) + 1;
      console.log('v is ' + v);
    }
  }

  s();
  s.func();
}

function l() {
  i++;
  j++;
  var i;
  var j;
}

function m() {
  i++;
  j++;
  var i;
  var j;
}