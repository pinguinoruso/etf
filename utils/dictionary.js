import { MK_BOOL, MK_NUM } from "./macros.js";

export const TK_TYPES = {
	"Cell": {
		regex: /^[A-Z]{1,2}\d+$/,
		type: "CELL_TK"
	},
	"Cell_Range":{
		regex: /^[A-Z]{1,2}\d+:$/,
		type: "CELLRANGE_TK"
	},
	"String": {
		regex: /[\"\'](?:\\.|[^"\\])*[\"\']/,
		type: "STRING_TK"
	},
	"Number":{
		regex: /[-]?\d+(\.\d+)?([eE][-]?\d+)?/,
		type: "NUM_TK"
	},
	"Identifier": {
		regex: /[a-zA-Z_][a-zA-Z0-9_]*/,
		type: "IDENTIFIER_TK"
	},
	"OPar":{
		regex: /\(/,
		type: "OPAR_TK"
	},
	"CPar":{
		regex: /\)/,
		type: "CPAR_TK"
	},
	"OBra":{
		regex: /\[/,
		type: "OBRA_TK"
	},
	"CBra":{
		regex: /\]/,
		type: "CBRA_TK"
	},
	"Comma": {
		regex: /\,/,
		type: "COMMA_TK"
	},
	
	"BinaryOp":{
		regex: /([\=\>\<\!]=|[\*]{2}|[\+\-\*\/\%\^\>\<])(?!\d)/,
		type: "BINOP_TK"
	},
	"Assign":{
		regex: /[\*\|\&]{2}=|[\+\-\?\/\*\^]{1}=|=/,
		type: "ASSIGN_TK"
	},
	"EOF":{
		regex: /[]/,
		type: "EOF"
	}
}

export const TK_UTILS = {
	getName: (type) => Object.keys(DICTIONARY).find(x => DICTIONARY[x].type == type),
	
}


export const master = new RegExp(Object.values(TK_TYPES).reduce((a,b) => String(a.regex ? a.regex.source : a) + "|" + String(b.regex ? b.regex.source : b)), "g");
export const commentReg = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g

export const KEYWORDS = {
	"VarDec":{
		words: ["SET", "CONST"],
		type: "VDEC_TK"
	},
	"VarType":{
		words: ["NUM", "STRING", "BOOL", "ANY","ARRAY"],
		type: "VTYPE_TK"
	},
	"Boolean": {
		words: ["FALSE", "TRUE"],
		type: "BOOL_TK"
	},
	"Nullish":{
		words: ["NULL", "UNDEFINED"],
		type: "NULL_TK"
	},
	"FuncDec":{
		words: [],
		type: ""
	},

}

export const DICTIONARY = {
	...TK_TYPES,
	...KEYWORDS
}

export const VAR_TYPES = {
	"NUM": "Number",
	"STRING": "String",
	"BOOL": "Boolean",
	"ANY": "Any",
	"ARRAY": "Array"
}

export const AST_Sanitizers = {
	"Program": (body) => ({body: body ?? [], type: "Program"}),
	"BinaryExp": (left, right, operator) => ({left, right, operator, type: "BinaryExp"}),
	"VarDeclaration": (constant, identifier, vType, value, subtype) => ({constant, identifier, value, vType, type: "VarDeclaration", subtype}),
	"Number": (value) => ({value:parseFloat(value), type: "Number"}),
	"Identifier": (value) => ({value, type: "Identifier"}),
	"VarDec": (value) => ({value, type: "VarDec"}),
	"VarType": (value) => ({value, type: "VarType"}),
	"String": (value) => ({value: String(value.slice(1,-1)), type: "String"}),
	"Assign": (id, value,oper) => ({id, value, oper, type: "Assign"}),
	"Boolean": (value) => ({value: value == "TRUE", type: "Boolean"}),
	"Nullish": () => ({value: null, type: "String"}),
	"Any": (value, asType) => ({value, type: "Any", asType}),
	"Array": (value) => ({value, type: "Array"}),
	"ArrAccess": (id, sub) => ({id, sub, type: "ArrAccess"}),
	"FunctionCall": (id, args) => ({id, args, type: "FunctionCall"}),
	"IfFunction": (statement, ifTrue, ifFalse) => ({statement, ifTrue, ifFalse, type: "IfFunction"})
}



export const BINOP_FUNCS = {
	">": (left, right) => MK_BOOL(left > right),
	"<": (left, right) => MK_BOOL(left < right),
	"<=": (left, right) => MK_BOOL(left <= right),
	">=": (left, right) => MK_BOOL(left >= right),
	"!=": (left, right) => MK_BOOL(left != right),
	"==": (left, right) => MK_BOOL(left == right),
	"-": (left, right) => MK_NUM(left - right),
	"+": (left, right) => MK_NUM(left + right),
	"*": (left, right) => MK_NUM(left * right),
	"/": (left, right) => MK_NUM(left / right),
	"**": (left, right) => MK_NUM(left ** right),
	"^": (left, right) => MK_NUM(left ** right),
	"%": (left, right) => MK_NUM(left % right),
	"||": (left, right) => MK_BOOL(left || right),
	"&&": (left, right) => MK_BOOL(left && right),
}
