"use strict";

module.exports = function evaluate(path, { tdz = false } = {}) {
  if (!tdz && !path.isReferencedIdentifier()) {
    return baseEvaluate(path);
  }

  if (path.isReferencedIdentifier()) {
    return evaluateIdentifier(path);
  }

  const state = {
    confident: true
  };

  // prepare
  path.traverse({
    Scope(scopePath) {
      scopePath.skip();
    },
    ReferencedIdentifier(idPath) {
      const binding = idPath.scope.getBinding(idPath.node.name);
      // don't deopt globals
      // let babel take care of it
      if (!binding) return;

      const evalResult = evaluateIdentifier(idPath);
      if (!evalResult.confident) {
        state.confident = evalResult.confident;
        state.deoptPath = evalResult.deoptPath;
      }
    }
  });

  if (!state.confident) {
    return state;
  }

  return baseEvaluate(path);
};

function baseEvaluate(path) {
  try {
    return path.evaluate();
  } catch (e) {
    return {
      confident: false,
      error: e
    };
  }
}

// Original Source:
// https://github.com/babel/babel/blob/master/packages/babel-traverse/src/path/evaluation.js
// modified for Babel-minify use
function evaluateIdentifier(path) {
  if (!path.isReferencedIdentifier()) {
    throw new Error(`Expected ReferencedIdentifier. Got ${path.type}`);
  }

  const { node } = path;

  const binding = path.scope.getBinding(node.name);

  if (!binding) {
    const { name } = node;
    if (!name) {
      return deopt(path);
    }

    switch (name) {
      case "undefined":
        return { confident: true, value: undefined };
      case "NaN":
        return { confident: true, value: NaN };
      case "Infinity":
        return { confident: true, value: Infinity };
      default:
        return deopt(path);
    }
  }

  if (binding.constantViolations.length > 0) {
    return deopt(binding.path);
  }

  // referenced in a different scope - deopt
  if (shouldDeoptBasedOnScope(binding, path)) {
    return deopt(path);
  }

  // let/var/const referenced before init
  // or "var" referenced in an outer scope
  const flowEvalResult = evaluateBasedOnControlFlow(binding, path);

  if (flowEvalResult.confident) {
    return flowEvalResult;
  }

  if (flowEvalResult.shouldDeopt) {
    return deopt(path);
  }

  return path.evaluate();
}

// check if referenced in a different fn scope
// we can't determine if this function is called sync or async
// if the binding is in program scope
// all it's references inside a different function should be deopted
function shouldDeoptBasedOnScope(binding, refPath) {
  if (binding.kind === "const") {
    return false;
  }

  if (binding.scope.path.isProgram() && refPath.scope !== binding.scope) {
    return true;
  }

  return false;
}

function evaluateBasedOnControlFlow(binding, refPath) {
  if (binding.kind === "var") {
    // early-exit
    const declaration = binding.path.parentPath;

    if (declaration.parentPath) {
      /**
       * Handle when binding is created inside a parent block and
       * the corresponding parent is removed by other plugins
       * if (false) { var a } -> var a
       */
      if (declaration.parentPath.removed) {
        return {
          confident: true,
          value: void 0
        };
      }
      if (
        declaration.parentPath.isIfStatement() ||
        declaration.parentPath.isLoop() ||
        declaration.parentPath.isSwitchCase()
      ) {
        return {
          shouldDeopt: true
        };
      }
    }

    const fnParent = (
      binding.path.scope.getFunctionParent() ||
      binding.path.scope.getProgramParent()
    ).path;

    let blockParentPath = binding.path.scope.getBlockParent().path;
    let blockParent = blockParentPath.node;

    if (blockParentPath === fnParent && !fnParent.isProgram()) {
      blockParent = blockParent.body;
    }

    // detect Usage Outside Init Scope
    const blockBody = blockParent.body;

    if (
      Array.isArray(blockBody) &&
      !blockBody.some(stmt => isAncestor(stmt, refPath))
    ) {
      return {
        shouldDeopt: true
      };
    }

    // Detect usage before init
    const stmts = fnParent.isProgram()
      ? fnParent.node.body
      : fnParent.node.body.body;

    const compareResult = compareBindingAndReference({
      binding,
      refPath,
      stmts
    });

    if (compareResult.reference && compareResult.binding) {
      if (
        compareResult.reference.scope === "current" &&
        compareResult.reference.idx < compareResult.binding.idx
      ) {
        return { confident: true, value: void 0 };
      }
    }
  } else if (binding.kind === "let" || binding.kind === "const") {
    // binding.path is the declarator
    const declarator = binding.path;
    const declaration = declarator.parentPath;

    if (
      declaration.parentPath &&
      (declaration.parentPath.isIfStatement() ||
        declaration.parentPath.isLoop() ||
        declaration.parentPath.isSwitchCase())
    ) {
      return { shouldDeopt: true };
    }

    const scopePath = declarator.scope.path;
    let scopeNode = scopePath.node;

    if (scopePath.isFunction() || scopePath.isCatchClause()) {
      scopeNode = scopeNode.body;
    }

    // Detect Usage before Init
    let stmts = scopeNode.body;
    if (!Array.isArray(stmts)) {
      stmts = [stmts];
    }

    const compareResult = compareBindingAndReference({
      binding,
      refPath,
      stmts
    });

    if (compareResult.reference && compareResult.binding) {
      if (
        compareResult.reference.scope === "current" &&
        compareResult.reference.idx < compareResult.binding.idx
      ) {
        throw new Error(
          `ReferenceError: Used ${refPath.node.name}: ` +
            `${binding.kind} binding before declaration`
        );
      }
      if (
        binding.kind !== "const" &&
        compareResult.reference.scope === "other"
      ) {
        return { shouldDeopt: true };
      }
    }
  }

  if (binding.kind === "const") {
    return { shouldDeopt: false };
  }

  return { confident: false, shouldDeopt: false };
}

function compareBindingAndReference({ binding, refPath, stmts }) {
  const state = {
    binding: null,
    reference: null
  };

  for (const [idx, stmt] of stmts.entries()) {
    if (isAncestor(stmt, binding.path)) {
      state.binding = { idx };
    }

    for (const ref of binding.referencePaths) {
      if (ref === refPath && isAncestor(stmt, ref)) {
        state.reference = {
          idx,
          scope: binding.path.scope === ref.scope ? "current" : "other"
        };
        break;
      }
    }
  }

  return state;
}

function deopt(deoptPath) {
  return {
    confident: false,
    deoptPath
  };
}

/**
 * is nodeParent an ancestor of path
 */
function isAncestor(nodeParent, path) {
  return !!path.findParent(parent => parent.node === nodeParent);
}
