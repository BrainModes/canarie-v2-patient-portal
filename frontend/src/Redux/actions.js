import {
	SET_ALL_STUDIES,
	SET_REFRESH_MODAL,
	SET_IS_LOGIN,
	SET_CURRENT_STUDY,
	SET_CURRENT_USER,
	SET_PUBLIC_STUDIES,
	SET_SURVEY_LINK,
	SET_SURVEY_QUEUE_LINK,
	SET_SURVEY_STATUS,
	SET_ATTRS_ORDER,
	UPDATE_ATTRS_ORDER,
	UPDATE_CURRENT_STUDY,
} from "./actionTypes";

export const setAllStudies = (allStudies) => ({
	type: SET_ALL_STUDIES,
	payload: {
		allStudies,
	},
});

export const setRefreshModal = (status) => ({
	type: SET_REFRESH_MODAL,
	payload: status,
});

export const setIsLoginCreator = (isLogin) => ({
	type: SET_IS_LOGIN,
	payload: isLogin,
});

export const setCurrentStudy = (payload) => ({
	type: SET_CURRENT_STUDY,
	payload,
});

export const updateCurrentStudy = (payload) => ({
	type: UPDATE_CURRENT_STUDY,
	payload,
});

export const setCurrentUser = (payload) => ({
	type: SET_CURRENT_USER,
	payload,
});

export const setPublicStudies = (studies) => ({
	type: SET_PUBLIC_STUDIES,
	payload: {
		studies,
	},
});

export const setSurveyLink = (link) => ({
	type: SET_SURVEY_LINK,
	payload: {
		surveyLink: link,
	},
});

export const setSurveyQueueLink = (link) => ({
	type: SET_SURVEY_QUEUE_LINK,
	payload: {
		surveyQueueLink: link,
	},
});

export const setSurveyStatus = (status) => ({
	type: SET_SURVEY_STATUS,
	payload: {
		isSurveyStarted: status,
	},
});

export const setAttrOrder = (payload) => ({
	type: SET_ATTRS_ORDER,
	payload
})

export const updateAttrOrder = (payload) => ({
	type: UPDATE_ATTRS_ORDER,
	payload,
});