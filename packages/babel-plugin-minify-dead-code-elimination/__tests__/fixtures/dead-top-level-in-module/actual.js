function unusedFn () {}
const unusedConst = '';
let unusedLet = null;
var unusedVar = 0;
class UnusedClass {}

function usedFn () {}
const usedConst = '';
let usedLet = null;
var usedVar = 0;
class UsedClass {}

export function exportedFn () {}
export const exportedConst = '';
export let exportedLet = null;
export var exportedVar = 0;
export class exportedClass {}

const defaultExport = 2;

export { usedFn, usedConst, usedLet, usedVar, UsedClass }

export default defaultExport;
