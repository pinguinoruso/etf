import { tokenize } from "./token.js";
import { AST_Sanitizers, KEYWORDS, TK_TYPES, TK_UTILS } from "./utils/dictionary.js";
import { MK_NULL, MK_NUM } from "./utils/macros.js";
const { Program, BinaryExp, Assign } = AST_Sanitizers;

function doOrError(state, ret, err) {
	if (state) return ret()
	else throw new Error(err)
}



export default class Parser {



	STATEMENTS_FUNC = {
		"CONST": () => {
			const isConst = this.eat().value == "CONST";
			const varT = this.expects(KEYWORDS.VarType.type, "Expected type");
			let subType
			if (varT.value == "ARRAY") {
				this.expects(TK_TYPES.OBra.type, "Expected '['");
				subType = this.expects(KEYWORDS.VarType.type, "Expected Array Subtype");
				this.expects(TK_TYPES.CBra.type, "Expected ']'");
			}
			const iden = this.expects(TK_TYPES.Identifier.type, "Expected identifier");
			if (this.eof()) {
				if (isConst) throw new Error("'CONST' declarations must be initialized.");
				return AST_Sanitizers["VarDeclaration"](isConst, iden.value, varT.value, subType);
			} else {
				const asTk = this.expects(TK_TYPES.Assign.type, "Expected assignment token");
				if (asTk.value != "=") throw new Error("Cannot use a reasignment token when declarating");
				return AST_Sanitizers["VarDeclaration"](isConst, iden.value, varT.value, this.parse(), subType);
			}
		},
		"SET": () => {
			const isConst = this.eat().value == "CONST";
			const varT = this.expects(KEYWORDS.VarType.type, "Expected type");
			let subType
			if (varT.value == "ARRAY") {
				this.expects(TK_TYPES.OBra.type, "Expected '['");
				subType = this.expects(KEYWORDS.VarType.type, "Expected Array Subtype");
				this.expects(TK_TYPES.CBra.type, "Expected ']'");
			}
			const iden = this.expects(TK_TYPES.Identifier.type, "Expected identifier");
			if (this.eof()) {
				if (isConst) throw new Error("'CONST' declarations must be initialized.");
				return AST_Sanitizers["VarDeclaration"](isConst, iden.value, varT.value, undefined, subType ? subType.value : null);
			} else {
				const asTk = this.expects(TK_TYPES.Assign.type, "Expected assignment token");
				if (asTk.value != "=") throw new Error("Cannot use a reasignment token when declarating");
				return AST_Sanitizers["VarDeclaration"](isConst, iden.value, varT.value, this.parse(), subType ? subType.value : null);
			}
		},
		"EXPORT": () => {
			const id = this.eat();
			const val = this.parse();
			return { type: "EXPORT", value: val }
		},
		"IF": () => {
			const id = this.eat();
			this.expects(TK_TYPES.OPar.type, "Expected '('");
			const statement = this.parse();
			if(this.at().type == TK_TYPES.Comma.type){
				this.eat();
				const ifTrue = this.parse();
				this.expects(TK_TYPES.Comma.type);
				const ifFalse = this.parse();
				this.expects(TK_TYPES.CPar.type, "Expected ')'");	
				return AST_Sanitizers["IfFunction"](statement, ifTrue, ifFalse);
			}

			
			return MK_NULL();
		}
	}

	eof = () => this.tokens[this.position][0].type == TK_TYPES.EOF.type;
	at = () => this.tokens[this.position][0];
	expects = (type, err) => doOrError(this.tokens[this.position][0].type == type, this.eat, err);
	eat = () => this.tokens[this.position].shift();


	parse() {
		return this.parseStatement();
	}

	parseStatement() {
		if (this.STATEMENTS_FUNC[this.at().value]) return this.STATEMENTS_FUNC[this.at().value]()
		else return this.parseExp();
	}

	parseExp() {
		return this.parseAssign();
	}


	parseAssign() {
		let left = this.parseLogic();
		if (["=", "-=", "+=", "/=", "*=", "%=", "^=", "**=", "||=", "&&=", "?="].includes(this.at().value)) {
			const operator = this.eat().value;
			const right = this.parseAssign();
			left = Assign(left.value, right, operator)
		}
		return left;
	}


	parseLogic() {
		let left = this.parseComp();
		while (["||", "&&"].includes(this.at().value)) {
			const operator = this.eat().value;
			const right = this.parseComp();
			left = BinaryExp(left, right, operator)
		}
		return left;
	}

	parseComp() {
		let left = this.parseAdditive();
		while (["==", ">=", "<=", "!=", ">", "<"].includes(this.at().value)) {
			const operator = this.eat().value;
			const right = this.parseAdditive();
			left = BinaryExp(left, right, operator)
		}
		return left;
	}

	parseAdditive() {
		let left = this.parseMulti();
		while (["+", "-"].includes(this.at().value)) {
			const operator = this.eat().value;
			const right = this.parseMulti();
			left = BinaryExp(left, right, operator)
		}
		return left;
	}

	parseMulti() {
		let left = this.parsePrimaryExp();
		while (["*", "/", "%", "^", "**"].includes(this.at().value)) {
			const operator = this.eat().value;
			const right = this.parsePrimaryExp();
			left = BinaryExp(left, right, operator)
		}
		return left;
	}

	parsePrimaryExp() {
		let tk = this.at();
		const tkName = TK_UTILS.getName(tk.type);

		

		if (tk.type == TK_TYPES.OPar.type) {
			this.expects(TK_TYPES.OPar.type);
			const value = this.parse();
			this.expects(TK_TYPES.CPar.type); // closeparen
			return value;
		}
		if (tk.type == TK_TYPES.OBra.type) {
			let array = [];
			this.eat();
			while (this.at().type != TK_TYPES.CBra.type) {
				array.push(this.parse());
				if (this.at().type != TK_TYPES.CBra.type) this.expects(TK_TYPES.Comma.type, `Expected ','`)
			}
			this.eat();
			return AST_Sanitizers["Array"](array)

		}
		tk = this.eat()
		if (tk.type == TK_TYPES.Identifier.type && this.at().type == TK_TYPES.OBra.type) {
			this.eat();
			const sub = this.parse();
			this.expects(TK_TYPES.CBra.type, "Expected ']'")
			return AST_Sanitizers["ArrAccess"](tk, sub);
		}

		if (tk.type == TK_TYPES.Identifier.type && this.at().type == TK_TYPES.OPar.type) {
			this.eat();
			let args = [];
			while (this.at().type != TK_TYPES.CPar.type) {
				const val = this.parse();
				args.push(val);

				if (this.at().type != TK_TYPES.CPar.type) this.expects(TK_TYPES.Comma.type, "Expected ','")
			}
			this.expects(TK_TYPES.CPar.type, "Expected ')'")
			return AST_Sanitizers["FunctionCall"](tk, args);
		}

		if (tk.type == TK_TYPES.Number.type && this.at().type == TK_TYPES.Number.type && this.at().value < 0) {
			return MK_NUM(parseFloat(tk.value) + parseFloat(this.eat().value));
		}


		return AST_Sanitizers[tkName](tk.value);

	}

	constructor(sourceCode) {
		this.tokens = tokenize(sourceCode);
		this.initLength = this.tokens.length;
		this.position = -1;
		const program = Program([]);
		for (const line in this.tokens) {
			let result = [];
			this.position = line;

			while (!this.eof()) {

				result.push(this.parse())
			}
			program.body.push(result);
		}
		return program;
	}
}


