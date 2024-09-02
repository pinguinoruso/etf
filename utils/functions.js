import { MK_BOOL, MK_NUM, MK_STRING } from "./macros.js";

const validateType = (type, ...args) => !args.some(x => x.type != type && x.asType != type)

export default {
	"SUM": (...args) => {
		if (args.some(x => x.type != "Number" && x.asType != "Number")) throw new Error("All arguments must be a Number");
		return MK_NUM(args.map(x => x.value).reduce((a, b) => a + b));
	},
	"AND": (...args) => {
		if (args.some(x => x.type != "Boolean" && x.asType != "Boolean")) throw new Error("All arguments must be a Boolean");
		return MK_BOOL(args.map(x => x.value).reduce((a, b) => a && b));
	},
	"AVERAGE": (...args) => {
		if (args[0].type == "Array") {
			return MK_NUM((args[0].value.map(x => x.value).reduce((a, b) => a + b)) / args[0].value.length);
		}
		if (args.some(x => x.type != "Number" && x.asType != "Number")) throw new Error("All arguments must be a Number");
		return MK_NUM((args.map(x => x.value).reduce((a, b) => a + b)) / args.length);
	},
	"AVERAGEIF": (contents, equal, rets) => {
		if (!contents || !equal || !rets) throw new Error("Expected 3 arguments");
		if (!validateType("Array", contents, rets)) throw new Error("Expected Array");
		if (validateType("Array", equal)) throw new Error("Expected Single Value");
		if (!validateType("Array", rets)) throw new Error("Expected Array");
		let parsedEqual = MK_STRING(equal.value);
		let indexs = [];
		for (let i = 0; i < contents.value.length; i++)
			if (MK_STRING(contents.value[i].value).value == parsedEqual.value) indexs.push(i);

		return MK_NUM(indexs.map((x, i) => rets.value[i].value).reduce((a, b) => a + b) / indexs.length);
	},
	"AVERAGEIFS": (values, ...args) => {
		if (!validateType("Array", values)) throw new Error("Expected Array");
		if (args.length == 0 || args.length % 2 != 0) throw new Error("Expected impair number of arguments");
		let founds = [];
		for (let i = 0; i < args.length; i += 2) {
			let indexs = [];
			let critRange = args[i];
			if (!validateType("Array", critRange)) throw new Error("Expected Array");
			let criterio = MK_STRING(args[i + 1].value);
			for (let j = 0; j < critRange.value.length; j++)
				if (MK_STRING(critRange.value[j].value).value == criterio.value) indexs.push(j);
			founds.push(indexs);
		}
		let indexs = founds[0].filter(x => founds.every(y => y.includes(x)));
		return MK_NUM(indexs.map((x, i) => values.value[i].value).reduce((a, b) => a + b) / indexs.length);
	},
	"CONCAT": (...args) => {
		let finals = [];
		args
			.forEach(x => validateType("Array", x) ? x.value.forEach(y => finals.push(y)) : finals.push(x));
		return MK_STRING(finals.map(x => x.value).join(""))
	},
	"CONCATENATE": (...args) => {
		let finals = [];
		args
			.forEach(x => validateType("Array", x) ? x.value.forEach(y => finals.push(y)) : finals.push(x));
		return MK_STRING(finals.map(x => x.value).join(""))
	},
	"COUNT": (...args) => {
		let finals = [];
		args
			.forEach(x => validateType("Array", x) ? x.value.forEach(y => finals.push(y)) : finals.push(x));
		
		return MK_NUM(finals.filter(x => validateType("Number", x)).length);
	},
	"COUNTA": (...args) => {
		let finals = [];
		args
			.forEach(x => validateType("Array", x) ? x.value.forEach(y => finals.push(y)) : finals.push(x));
		return MK_NUM(finals.filter(x => !(validateType("String", x) && x.value == null)).length);
	},
	"COUNTBLANK": (...args) => {
		let finals = [];
		args
			.forEach(x => validateType("Array", x) ? x.value.forEach(y => finals.push(y)) : finals.push(x));
		return MK_NUM(finals.filter(x => (validateType("String", x) && x.value == null)).length);
	},
	"COUNTIF": (vals, criteria) => {
		if(!validateType("Array", vals)) throw new Error("Expected Array");
		if(validateType("Array", criteria)) throw new Error("Expected value");
		return MK_NUM(vals.value.filter(x => x.value == criteria.value).length);
	}
}