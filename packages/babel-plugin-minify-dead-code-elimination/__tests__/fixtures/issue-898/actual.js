function a() {
  if (true) {
    return;
  }

  var c = b();
  return c;
}

function c() {
  if (true) {
    if (true) {
      return;
    }
  }

  var c = b();
  return c;
}

function noReturnIf() {
  if (true) {}

  var c = b();
  return c;
}

function noReturnElse() {
  if (false) {
    return;
  } else {}

  var c = b();
  return c;
}

function removeSubsequentIf() {
  // remove if's subsequent siblings
  if (true) {
    return 1;
  }
  var v = 2;
  console.log(v);
}

function removeSubsequentElse() {
  // remove else's subsequent siblings
  if (false) {
    return;
  } else {
    return 1;
  }
  var v = 2;
  console.log(v);
}

function g() {
  // preserve function
  g.func = func;
  if (true) {
    return 1;
  }
  function func() {}
}

var variableToBeUsed = 1;
function h() {
  // leave used variables
  h.variableToBeUsed = variableToBeUsed;
  if (true) {
    return 1;
    var variableToBeUsed = 2;
  }
}

function blockLocalIf() {
  // preserve block-local function declared inside „consequent” block
  var a = 1;
  foo.a = a;
  if (true) {
    a();
    return a;
    function a() {}
  }
}

function blockLocalElse() {
  // preserve block-local function declared inside „alternate” block
  var a = 1;
  foo.a = a;
  if (false) {
    return;
  } else {
    a();
    return a;
    function a() {}
  }
}

function i() {
  var i1 = ' ';
  _i += i1 + i2 + i3 + i4 + i5 + i6 + i7;
  if (true) {
    return;
    var i2 = 2;
  } else {
    var i3 = 3;
  }
  var i4 = 4;
  var i5 = 5;
  while (true) {
    var i6 = 6;
    if (false) {
      var i7 = 7;
    }
  }
}

function j() {
  var i1 = ' ';
  _i += i1 + i2 + i3 + i4 + i5 + i6 + i7;
  if (false) {
    var i3 = 3;
  } else {
    return;
    var i2 = 2;
  }
  var i4 = 4;
  var i5 = 5;
  while (true) {
    var i6 = 6;
    if (false) {
      var i7 = 7;
    }
  }
}

function k() {
  var v = 43;
  var _ss = 3;
  function s() {
    s.func = func;
    s._s = _s;
    s._ss = _ss;
    if (true) {
      return 1;
      var _s = 1;
    }
    console.log('no-hi');
    var unusedToBeRemoved = 2;
    var v = (console.log('no-hi2'), 42);
    function func() {
      v = (v | 0) + 1;
      console.log('v is ' + v);
    }
    console.log('test2');
  }
  s();
  s.func();
}

function l() {
  i++;
  j++;
  if (true) {
    return;
    var i = meow();
    for(;;) {
      var j = 2;
    }
  }
}

function m() {
  i++;
  j++;
  if (false) {
    return 2;
  } else {
    return;
    var i = meow();
    for(;;) {
      var j = 2;
    }
  }
}