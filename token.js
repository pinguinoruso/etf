import { KEYWORDS, TK_TYPES, commentReg, master } from "./utils/dictionary.js"
import { MK_EOF } from "./utils/macros.js";

const token = (type, value) => ({ type, value })



function sanitize(raw = "") {
	let t = raw
		.replace(commentReg, "")
		.split(";")
		.map(x => x
			.trim()
			.match(master)
		)
		.filter(x=>x)
		return t;

}

export function tokenize(raw) {
	let src = sanitize(raw);
	let finals = [];
	for (const line of src) {
		let tokens = [];
		for (const part of line) {
			let { type } = Object.values(TK_TYPES).find(x => x.regex.test(part))
			const kw = Object.values(KEYWORDS).find(x => x.words.includes(part));
			tokens.push(token(kw?.type || type, part));
		}
		tokens.push(MK_EOF())
		finals.push(tokens);
	}
	return finals;
}
