import { SET_SURVEY_LINK, SET_SURVEY_QUEUE_LINK, SET_SURVEY_STATUS } from "../actionTypes";
const initalState = {
	isSurveyStarted: false,
};

export default function (state = initalState, action) {
	switch (action.type) {
		case SET_SURVEY_LINK: {
			return { ...state, ...action.payload, };
		}
        case SET_SURVEY_QUEUE_LINK: {
			return { ...state, ...action.payload, };
		}
		case SET_SURVEY_STATUS: {
			return { ...state, ...action.payload, };
		}
		default:
			return state;
	}
}
