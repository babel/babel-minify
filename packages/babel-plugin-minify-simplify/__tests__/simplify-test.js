/**
 * This file also contains code from UglifyJS, which is BSD Licensed.
 *
 * UglifyJS is Copyright 2012-2013 (c) Mihai Bazon <mihai.bazon@gmail.com>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *     * Redistributions of source code must retain the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer.
 *
 *     * Redistributions in binary form must reproduce the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
 * THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

jest.autoMockOff();

const comparisonPlugin = require("../../babel-plugin-transform-simplify-comparison-operators/src");
const plugin = require("../src/index");

const thePlugin = require("test-transform")(plugin);

describe("simplify-plugin", () => {
  thePlugin(
    "should fix issue#323 with != and !==",
    `
    function foo() {
      var x, y;
      y = o[x];
      foo(y !== undefined);
    }
  `,
    `
    function foo() {
      var x, y;
      y = o[x], foo(y !== undefined);
    }
  `,
    {
      plugins: [plugin, comparisonPlugin]
    }
  );

  // From UglifyJS
  thePlugin.inEachLine(
    "should simplify logical expression of the following forms of && by compressing to the right",
    `
    a = true && foo
    a = 1 && console.log("asdf")
    a = 4 * 2 && foo()
    a = 10 == 10 && foo() + bar()
    a = "foo" && foo()
    a = 1 + "a" && foo / 10
    a = -1 && 5 << foo
    a = 6 && 10
    a = !NaN && foo()
  `,
    `
    a = foo;
    a = console.log("asdf");
    a = foo();
    a = foo() + bar();
    a = foo();
    a = foo / 10;
    a = 5 << foo;
    a = 10;
    a = foo();
  `
  );

  thePlugin.inEachLine(
    "should simplify logical expression of the following forms of && by compressing to the left",
    `
    a = false && bar
    a = NaN && console.log("a")
    a = 0 && bar()
    a = undefined && foo(bar)
    a = 3 * 3 - 9 && bar(foo)
    a = 9 == 10 && foo()
    a = !"string" && foo % bar
    a = 0 && 7
  `,
    `
    a = false;
    a = 0 / 0;
    a = 0;
    a = undefined;
    a = 0;
    a = false;
    a = false;
    a = 0;
  `
  );
  thePlugin.inEachLine(
    "should not simplify invalid logical expression of the following forms of &&",
    `
    a = foo() && true;
    a = console.log && 3 + 8;
    a = foo + bar + 5 && "a";
    a = 4 << foo && -1.5;
    a = bar() && false;
    a = foo() && 0;
    a = bar() && NaN;
    a = foo() && null;
  `
  );

  thePlugin.inEachLine(
    "should simplify logical expression of the following forms of || by compressing to the left",
    `
    a = true     || condition;
    a = 1        || console.log("a");
    a = 2 * 3    || 2 * condition;
    a = 5 == 5   || condition + 3;
    a = "string" || 4 - condition;
    a = 5 + ""   || condition / 5;
    a = -4.5     || 6 << condition;
    a = 6        || 7;
  `,
    `
    a = true;
    a = 1;
    a = 6;
    a = true;
    a = "string";
    a = "5";
    a = -4.5;
    a = 6;
  `
  );

  thePlugin.inEachLine(
    "should simplify logical expression of the following forms of || by compressing to the right",
    `
    a = false     || condition;
    a = 0         || console.log("b");
    a = NaN       || console.log("c");
    a = undefined || 2 * condition;
    a = null      || condition + 3;
    a = 2 * 3 - 6 || 4 - condition;
    a = 10 == 7   || condition / 5;
    a = !"string" || 6 % condition;
    a = null      || 7;
  `,
    `
    a = condition;
    a = console.log("b");
    a = console.log("c");
    a = 2 * condition;
    a = condition + 3;
    a = 4 - condition;
    a = condition / 5;
    a = 6 % condition;
    a = 7;
  `
  );

  thePlugin.inEachLine(
    "should not simplify invald logical expression of the following forms of || by compressing to the right",
    `
    a = condition || true;
    a = console.log("a") || 2;
    a = 4 - condition || "string";
    a = 6 << condition || -4.5;
    a = condition || false;
    a = console.log("b") || NaN;
    a = console.log("c") || 0;
    a = 2 * condition || undefined;
    a = condition + 3 || null;
  `
  );

  thePlugin.inEachLine(
    "should transform complex logical expressions",
    `
    a = true && 1 && foo
    a = 1 && 4 * 2 && console.log("asdf")
    a = 4 * 2 && NaN && foo()
    a = 10 == 11 || undefined && foo() + bar() && bar()
    a = -1 && undefined || 5 << foo
  `,
    `
    a = foo;
    a = console.log("asdf");
    a = 0 / 0;
    a = undefined;
    a = 5 << foo;
  `
  );

  thePlugin.inEachLine(
    "should simplify assignments",
    `
    x = x + 1;
    x = x - 1;
    x = x * 1;
    x = x % 1;
    x = x << 1;
    x = x >> 1;
    x = x >>> 1;
    x = x & 1;
    x = x | 1;
    x = x ^ 1;
    x = x / 1;
    x = x ** 1;
  `,
    `
    x += 1;
    x -= 1;
    x *= 1;
    x %= 1;
    x <<= 1;
    x >>= 1;
    x >>>= 1;
    x &= 1;
    x |= 1;
    x ^= 1;
    x /= 1;
    x **= 1;
  `
  );

  thePlugin.inEachLine(
    "should not simplify assignments when it is not an equal operator",
    `
    x += x + 1;
    x -= x - 1;
    x *= x * 1;
    x %= x % 1;
    x <<= x << 1;
    x >>= x >> 1;
    x >>>= x >>> 1
    x &= x & 1;
    x |= x | 1;
    x ^= x ^ 1;
    x /= x / 1;
    x **= x ** 1;
  `,
    `
    x += x + 1;
    x -= x - 1;
    x *= x * 1;
    x %= x % 1;
    x <<= x << 1;
    x >>= x >> 1;
    x >>>= x >>> 1;
    x &= x & 1;
    x |= x | 1;
    x ^= x ^ 1;
    x /= x / 1;
    x **= x ** 1;
  `
  );

  thePlugin.inEachLine(
    "should not simplify assignments further when it is not an equal operator",
    `
    x = x + (x >> 1);
    x = x - (x >> 1);
    x = x * (x >> 1);
    x = x % (x >> 1);
    x = x << (x >> 1);
    x = x >> (x >> 1);
    x = x >>> (x >> 1);
    x = x & (x >> 1);
    x = x | (x >> 1);
    x = x ^ (x >> 1);
    x = x / (x >> 1);
    x = x ** (x >> 1);
  `,
    `
    x += x >> 1;
    x -= x >> 1;
    x *= x >> 1;
    x %= x >> 1;
    x <<= x >> 1;
    x >>= x >> 1;
    x >>>= x >> 1;
    x &= x >> 1;
    x |= x >> 1;
    x ^= x >> 1;
    x /= x >> 1;
    x **= x >> 1;
  `
  );

  thePlugin.inEachLine(
    "should simplify assignments 2",
    `
    foo = foo + bar;
    foo = foo * function(){};
    foo += 123;
    foo = 1 + foo;
    x = 'hi';
    x = x = x + 1;
    foo = foo + bar + baz;
  `,
    `
    foo += bar;
    foo *= function () {};
    foo += 123;
    foo = 1 + foo;
    x = 'hi';
    x = x += 1;
    foo = foo + bar + baz;
  `
  );

  // TODO: foo[void 0] = foo[void 0] + 1;
  thePlugin.inEachLine(
    "should simplify assignments w. member expressions",
    `
    foo.bar = foo.bar + 1;
    foo.bar = foo.bar + 2;
    foo["x"] = foo[x] + 2;
    foo[x] = foo[x] + 2;
    foo[x] = foo["x"] + 2;
    foo["x"] = foo["x"] + 2;
    foo[1] = foo["1"] + 2;
    foo["bar"] = foo["bar"] + 2;
    foo[bar()] = foo[bar()] + 2;
    foo[""] = foo[""] + 2;
    foo[2] = foo[2] + 2;
    foo[{}] = foo[{}] + 1;
    foo[function(){}] = foo[function(){}] + 1;
    foo[false] = foo[false] + 1;
    foo.bar.baz = foo.bar.baz + 321;
    this.hello = this.hello + 1;
    foo[null] = foo[null] + 1;
    foo[undefined] = foo[undefined] + 1;
    foo.bar = foo.bar || {};
    bar.baz = foo.bar.baz + 'x';
    foo.bar.baz = bar.baz + 'x';
  `,
    `
    foo.bar += 1;
    foo.bar += 2;
    foo["x"] = foo[x] + 2;
    foo[x] += 2;
    foo[x] = foo["x"] + 2;
    foo["x"] += 2;
    foo[1] += 2;
    foo["bar"] += 2;
    foo[bar()] = foo[bar()] + 2;
    foo[""] += 2;
    foo[2] += 2;
    foo[{}] = foo[{}] + 1;
    foo[function () {}] = foo[function () {}] + 1;
    foo[false] += 1;
    foo.bar.baz += 321;
    this.hello += 1;
    foo[null] += 1;
    foo[undefined] += 1;
    foo.bar = foo.bar || {};
    bar.baz = foo.bar.baz + 'x';
    foo.bar.baz = bar.baz + 'x';
  `
  );
});
