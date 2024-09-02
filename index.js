import { evaluate } from "./interpreter.js";
import Parser from "./parse.js";
import Enviroment from "./utils/enviroments.js";


export default class ETFInterpreter{
	static run(src) {
		const AST = new Parser(src).body;
		const envi = new Enviroment();
		const result = (evaluate(AST, envi)).map(x => x.filter(a => a)).filter(b => b.length > 0);
		for (const line of result)
			for (const part of line)
				if (part.type && part.type == "EXPORT") return part.value;
		return null;
	}

	static getLineValue(src){
		const AST = new Parser(src).body;
		const envi = new Enviroment();
		const result = (evaluate(AST, envi)).map(x => x.filter(a => a)).filter(b => b.length > 0);
		if(result[0][0].type == "EXPORT") return result[0][0].value;
		return result[0]
	}
}

