import { SET_CURRENT_USER } from "../actionTypes";
const initalState = {};

export default function (state = initalState, action) {
	switch (action.type) {
		case SET_CURRENT_USER: {
			return action.payload;
		}
		default:
			return state;
	}
}
