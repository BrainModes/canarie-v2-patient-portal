import { SET_ALL_STUDIES, SET_CURRENT_STUDY, UPDATE_CURRENT_STUDY } from "../actionTypes";
const initalState = {
	allStudies: [],
	currentStudy: {},
};

export default function (state = initalState, action) {
	switch (action.type) {
		case SET_ALL_STUDIES: {
			const { allStudies } = action.payload;
			return { ...state, allStudies };
		}
		case SET_CURRENT_STUDY:
			return {
				...state,
				currentStudy: action.payload
			}
		case UPDATE_CURRENT_STUDY:
			return {
				...state,
				currentStudy: { ...state.currentStudy, ...action.payload }
			}
		default:
			return state;
	}
}
