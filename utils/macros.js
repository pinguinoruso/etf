
//UTILS
const toNum = (x) => isNaN(x) ? 0 : parseFloat(x);

//MACROS
export const MK_NUM = (n=0) => ({value: toNum(n) || 0, type: "Number"}); 
export const MK_NULL = () => ({value: null || 0, type: "String"});
export const MK_ARRAY = (value) => ({value: [...value] || 0, type: "Array"});
export const MK_STRING = (s="") => ({value: String(s), type: "String"});
export const MK_BOOL = (b=true) => ({value: Boolean(b), type: "Boolean"});
export const MK_EOF = () => ({value: "", type: "EOF"});
