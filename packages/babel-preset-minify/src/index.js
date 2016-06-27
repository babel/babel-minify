module.exports = {
  minified: true,
  plugins: [
    require('babel-plugin-minify-computed-properties'),
    require('babel-plugin-minify-constant-folding'),
    require('babel-plugin-minify-dead-code-elimination'),
    require('babel-plugin-minify-infinity'),
    require('babel-plugin-minify-mangle-names'),
    require('babel-plugin-minify-replace'),
    require('babel-plugin-minify-simplify'),
    require('babel-plugin-minify-type-constructors'),
    require('babel-plugin-minify-undefined'),
    require('babel-plugin-transform-member-expression-literals'),
    require('babel-plugin-transform-merge-sibling-variables'),
    require('babel-plugin-transform-minify-booleans'),
  ],
};
