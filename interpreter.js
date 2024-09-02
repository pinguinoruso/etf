import { MK_NULL } from "./utils/macros.js";
import { BINOP_FUNCS, TK_TYPES, VAR_TYPES } from "./utils/dictionary.js";
import functions from "./utils/functions.js";

const evals = {
	'BinaryExp': (binop, env) => {
		let lhs = evaluateSingle(binop.left, env);
		let rhs = evaluateSingle(binop.right, env);
		if(lhs.type == "Any") lhs.type = lhs.asType
		if(rhs.type == "Any") rhs.type = rhs.asType
		if(lhs.type != rhs.type ) throw Error("Can't evaluate a binary expression between different types");
		return BINOP_FUNCS[binop.operator](lhs.value, rhs.value);
	},
	'Program': (program, env) => {
		let lastEval = MK_NULL()
		for (let i = 0; i < program.body.length; i++) {
			const statm = program.body[i];
			lastEval = evaluateSingle(statm, env);
		}
		return lastEval;
	},
	'Identifier': (astNode, env) => {
		const val = env.lookupVar(astNode.value).value;
		return val;
	},
	'Array': (astNode, env) => {
		
		const parsedVals = astNode.value.map(x => evaluateSingle(x, env));
		//Perfect in theory, bullshit in practice.
		//if(!Object.keys(VAR_TYPES).find(x => parsedVals.every(a => a.type == VAR_TYPES[x]))) throw new Error("All values in array must have the same type");
		return {value: parsedVals, type: "Array"};
	},
	"IfFunction": (astNode, env) => {
		const {statement, ifTrue, ifFalse} = astNode;
		const parsedStatement = evaluateSingle(statement, env);
		if(parsedStatement.type != VAR_TYPES.BOOL) throw new Error("Expected boolean statement");
		
		if(parsedStatement.value == true){
			return evaluateSingle(ifTrue); 
		}else return evaluateSingle(ifFalse);
	},
	'FunctionCall': (astNode, env) => {
		if(!functions[astNode.id.value]) throw new Error("No function found");
		return functions[astNode.id.value](...astNode.args.map(x => evaluateSingle(x, env)));
	},
	'VarDeclaration': (varDec, env) => {
		if(env.existsVar(varDec.identifier)) throw new Error("Variable is already declarated");
		env.declareVar(varDec.identifier, varDec.vType, varDec.value, varDec.constant, varDec.subtype);
		return MK_NULL();
	},
	"Assign": (varAs, env) => {
		if(!env.existsVar(varAs.id)) throw new Error("Variable does not exists");
		return env.assignVar(varAs.id, varAs.value)
	},
	"ArrAccess": (varAcc, env) => {
		if(!env.existsVar(varAcc.id.value)) throw new Error("Array does not exists");
		const arr = env.lookupVar(varAcc.id.value).value;
		if(arr.type != "Array") throw new Error("Variable is not an array");
		const sub = evaluateSingle(varAcc.sub, env);
		if(sub.type != "Number" || sub.value != parseInt(sub.value)) throw new Error("Array position has to be an integrer");
		return arr.value[sub.value];
	},
	'EXPORT': (value, env) =>  ({type:"EXPORT", value: evaluateSingle(value.value, env)})
}

export function evaluate(AST, env) {
	let mes = [];
	for (const line of AST) {
		let res = [];
		for (const part of line) {
			const knd = part.type;
			if (evals[knd]) res.push(evals[knd](part, env));
			else res.push(part);
		}
		mes.push(res);
	}
	return mes;
}

export function evaluateSingle(astNode, envi) {
	const knd = astNode.type;
	if (evals[knd]) return (evals[knd](astNode, envi));
	else return (astNode);
}