"use strict";

module.exports = function({ types: t }) {
  function isEnvRequired(required, name) {
    return (
      (required && typeof required === 'boolean') || 
      (required && Array.isArray(required) && required.indexOf(key.value) !== -1 )
    );
  }
  function isLeftSideOfAssignmentExpression(path) {
    return (
      t.isAssignmentExpression(path.parent) && path.parent.left === path.node
    );
  }
  return {
    name: "transform-inline-environment-variables",
    visitor: {
      MemberExpression(path, { opts: { include, exclude, required } = {} }) {
        if (path.get("object").matchesPattern("process.env")) {
          const key = path.toComputedKey();
          if (
            t.isStringLiteral(key) &&
            !isLeftSideOfAssignmentExpression(path) &&
            (!include || include.indexOf(key.value) !== -1) &&
            (!exclude || exclude.indexOf(key.value) === -1)
          ) {
            if (
              isEnvRequired(required,key.value) &&
              !process.env[key.value]
            ) { 
              throw "Environment Variable "+key.value+" was expected but not found"
            }
            path.replaceWith(t.valueToNode(process.env[key.value]));
          }
        }
      }
    }
  };
};
