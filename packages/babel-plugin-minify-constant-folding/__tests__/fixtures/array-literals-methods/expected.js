4;
4;

"1,2,3";
"a,b,c";
"a@b@c";
"/1";
[/xyz/im, true].join("abc");
[`a${xyz}`].join("1");
"abc";

3;
2;
2;
void 0;

void 0;
2;

[1, 2, 3];
[2, 3];
[1, 2];
[1, 2, 3].slice(0, -1);

3;
c;
void 0;

[c, b, a];
[3, 2, 1];

[2, 3];
[2, 3];

// bad calls
[1, 2, 3][concat]([4, 5, 6]);
[a, "b", "c"].join();
["a", "b", "c"].join(a);
[1, 2, 3].splice("a");