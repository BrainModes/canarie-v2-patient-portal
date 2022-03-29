import { serverAxios as axios } from "./config";
import Axios from "axios";

function getStudiesAPI() {
	return axios({
		url: "/v1/studylist",
		method: "GET",
	});
}

/**
 * Get studies by some search terms
 *
 * @param {*} data
 * @returns
 */
function searchStudiesAPI(data) {
	return axios({
		url: "/v1/studylist",
		method: "POST",
		data,
	});
}

/**
 * getContainers
 *
 * @param {*} params params - level:int, default to be empty, start:boolean
 * @returns
 */
function getContainers() {
	return axios({
		url: "/v1/containers",
		method: "GET",
		params: { relation: '["admin", "member", "patient"]' },
	});
}

function getPatients(studyId) {
	return axios({
		url: `/v1/${studyId}/patients`,
		method: "GET",
	});
}

function getResearchers(studyId) {
	return axios({
		url: `/v1/${studyId}/researchers`,
		method: "GET",
	});
}

function getResearcherApplicable(studyId) {
	return axios({
		url: `/v1/${studyId}/applicable`,
		method: "GET",
	});
}

function addResearcherApplicable(studyId, user, role) {
	return axios({
		url: `/v1/${studyId}/applicable`,
		method: "POST",
		data: { user, role },
	});
}

function getSisterContainerResearch(studyId) {
	return axios({
		url: `/v1/${studyId}/listusers?relation=sister`,
		method: "GET",
	});
}

function RemoveResearcher(studyId, user, permission) {
	return axios({
		url: `/v1/${studyId}/applicable`,
		method: "DELETE",
		data: { user },
	});
}

function getUserlistInContainer(id) {
	return axios({
		url: `v1/${id}/users`,
		method: "GET",
		params: { relation: '["admin", "member", "patient"]' },
	});
}

function getRedCapToken(id) {
	return axios({
		url: `v1/${id}/datasetproperty`,
		method: "GET",
		params: { key: "redap_token" },
	});
}

function updateRedCapToken(id, value) {
	return axios({
		url: `v1/${id}/datasetproperty`,
		method: "POST",
		params: { key: "redap_token", value },
	});
}

function checkRedCapSurvey(id, studyId) {
	return axios({
		url: "/v1/user-survey/check",
		method: "POST",
		data: {
			survey_id: id,
			study_id: studyId,
		},
	});
}

function getRedCapSurveyQueueLink(id, studyId) {
	return axios({
		url: "/v1/user-survey-queue/link",
		method: "POST",
		data: {
			survey_id: id,
			study_id: studyId,
		},
	});
}

function getRedCapSurveyLink(id, studyId) {
	return axios({
		url: "/v1/user-survey/link",
		method: "POST",
		data: {
			survey_id: id,
			study_id: studyId,
		},
	});
}

function getSurveysCompeleteStatus(studyId) {
	return axios({
		url: "/v1/user-survey/status",
		params: {
			study_id: studyId,
		},
	});
}

function setAttributes(id, attributes) {
	return axios({
		url: `/v1/dataset/${id}/properties`,
		method: "POST",
		data: attributes,
	});
}

function checkAttributes(id) {
	return axios({
		url: `/v1/dataset/${id}/properties`,
	});
}

function deleteAttribute(id, attribute) {
	return axios({
		url: `/v1/dataset/${id}/properties/${attribute}`,
		method: "DELETE",
	});
}

function getPublicStudies() {
	return axios({
		url: "v1/dataset/discoverable",
	});
}

function getWareHouseDataAPI(userName) {
	return axios({
		url: `v1/fitbit/data-points/step_count?username=${userName}`,
		method: "GET",
	});
}

export {
	getStudiesAPI,
	searchStudiesAPI,
	getContainers,
	getPatients,
	getResearchers,
	getResearcherApplicable,
	addResearcherApplicable,
	getSisterContainerResearch,
	RemoveResearcher,
	getUserlistInContainer,
	getRedCapToken,
	updateRedCapToken,
	checkRedCapSurvey,
	getRedCapSurveyQueueLink,
	setAttributes,
	checkAttributes,
	deleteAttribute,
	getPublicStudies,
	getRedCapSurveyLink,
	getSurveysCompeleteStatus,
	getWareHouseDataAPI,
};
