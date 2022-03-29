import { store } from "../Redux/store";

/**
 * convert generic function to action creator&dispatcher
 * @param {function | Array<function>} funcs a function or an Array of function to create an redux action.
 * @returns {function | Array<function>} the action dispatcher
 */
export default function reduxActionWrapper(funcs) {
	if (Array.isArray(funcs)) {
		return funcs.map((item) => helper(item));
	} else {
		return helper(funcs);
	}
}

function helper(func) {
	if (typeof func !== "function") {
		throw new Error("You should pass a function");
	}
	return (actionParams) => {
		store.dispatch(func(actionParams));
	};
}
