import { SET_PUBLIC_STUDIES } from "../actionTypes";
const initalState = [];

export default function (state = initalState, action) {
	switch (action.type) {
		case SET_PUBLIC_STUDIES: {
			const { studies } = action.payload;
			return studies;
		}
		default:
			return state;
	}
}
