import { evaluateSingle } from "../interpreter.js";
import { VAR_TYPES } from "./dictionary.js";

export default class Enviroment{
	constructor(envi=null){
		this.parent = envi;
		this.vars = new Map();
	}
	declareVar(varName, type, value, constant, subtype){
		if(this.vars.has(varName)) throw new Error(`Cannot declare again variable "${varName}"`);
		let parsedVal = evaluateSingle(value, this);
		if(VAR_TYPES[type] == "Any"){
			this.vars.set(varName, {value: {type: "Any", value: parsedVal.value, asType: parsedVal.type}, constant})
			return;
		}
	//	if(parsedVal.type == "Array") console.log({varName, subtype, value, lol: Object.values(VAR_TYPES).find(x => x != "ARRAY" && parsedVal.value.every(a => a.type == x))})
		if(parsedVal.type != VAR_TYPES[type]) throw new Error("TYPE ERROR");
		if(parsedVal.type == "Array" && VAR_TYPES[subtype] != "Any"){
			const valType = Object.values(VAR_TYPES).find(x => x != "ARRAY" && parsedVal.value.every(a => a.type == x));
			if(!valType || valType != VAR_TYPES[subtype])throw new Error("Array subvalues are incorrect");
		}
		this.vars.set(varName, {value: parsedVal, constant, subtype:VAR_TYPES[subtype] });
		return;
	}

	assignVar(varName, value){
		const env = this.resolve(varName);
		const initial = this.lookupVar(varName);
		const parsedVal = evaluateSingle(value, env);
		if(initial.constant) throw new Error("Cannot re-assign a constant");
		if(parsedVal.type != initial.value.type) throw new Error("TYPE ERROR"); 
		if(initial.value.type == "Array" && parsedVal.subtype != initial.value.subtype) throw new Error("Array's re-assignations must contain an array with the same subtype"); 
		env.vars.set(varName, {value: parsedVal, constant: false, subtype: parsedVal.subtype ?? null });

		
		return evaluateSingle(value, this);
	}

	lookupVar(varName){
		const env = this.resolve(varName);
		return env.vars.get(varName);
	}

	existsVar(varName){
		return this.vars.has(varName);
	}

	resolve(varName){
		if(this.vars.has(varName)) return this;
		if(this.parent == null) throw new Error(`Cannot resolve variable "${varName}"`)
		else return this.parent.resolve(varName);
	}
}