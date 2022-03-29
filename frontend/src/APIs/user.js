import { serverAxios as axios } from "./config";
import { objectKeysToSnakeCase } from "../Utility";
/**
 * Admin Invite User
 *
 * @param {*} data
 * @returns success/fail
 */
function inviteUser(data) {
	return axios({
		url: "/v1/admin/invite",
		method: "POST",
		data,
	});
}

/**
 * Get user inforamtion with token
 *
 * @param {string} token
 * @returns {object} user information
 */
function getUserInformation(token) {
	return axios({
		url: `/v1/admin/invite/${token}`,
		method: "GET",
	});
}

/**
 * Register a user
 *
 * @param {object} data
 * @returns {string} user ID from keycloak
 */
function addUser(data) {
	return axios({
		url: `/v1/admin/users`,
		method: "POST",
		data: { ...data, realm: "canarie" },
	});
}

/**
 * List all users
 *
 * @param {object} data
 * @returns {array} array of users
 */
function getUsers() {
	return axios({
		url: `/v1/admin/userlist/canarie`,
		method: "GET",
	});
}

/**
 * Verify user by email or username
 *
 * @param {object} data
 * @returns {Object} userinfo, or {}, if user not exist
 */
function checkUserInfo(data) {
	return axios({
		url: `/v1/admin/userinfo`,
		method: "POST",
		data: { ...data, realm: "canarie" },
	});
}

/**
 * Suspend user(s)
 *
 * @param {object} data an array of users
 * @returns {Object} userinfo, or {}, if user not exist
 */
function suspendUsers(users) {
	return axios({
		url: `/v1/admin/users`,
		method: "DELETE",
		data: { users, realm: "canarie" },
	});
}

/**
 * Activate user(s)
 *
 * @param {object} data an array of users
 * @returns {Object} successed_list, failed_list
 */
function activateUsers(users) {
	return axios({
		url: `/v1/admin/users`,
		method: "PUT",
		data: { users, realm: "canarie" },
	});
}

/**
 * Refresh users session
 *
 * @param {object} data {refreshtoken:<token>}
 * @returns {Object} with new refresh_token and access_token
 */
function refreshTokenAPI(data) {
	return axios({
		url: `/v1/users/refresh`,
		method: "POST",
		data: { ...data, realm: "canarie" },
	});
}

function register(data) {
	return axios({
		url: `/v1/admin/users`,
		method: "POST",
		data: {
			...data,
			realm: "canarie",
			role: "patient",
		},
	});
}

function readToken(invitationHash) {
	return axios({
		url: `/v1/admin/invite/${invitationHash}`,
		method: "GET",
	});
}

function answerQuestion(invitationHash, answer, projectId) {
	return axios({
		url: `/v1/admin/answer/${invitationHash}`,
		method: "POST",
		data: {
			answer,
			project_id: projectId,
		},
	});
}

function changeRole(studyId, userId, relation) {
	return axios({
		url: `/v1/${studyId}/assign/${userId}?relation=${relation}`,
		method: "PUT",
	});
}

function forgotPassword(email) {
	return axios({
		url: `/v1/users/password/forget`,
		method: "PUT",
		data: {
			email,
			realm: "canarie",
		},
	});
}

function getInvitaions(params) {
	return axios({
		url: `v1/admin/invitation-list`,
		method: "GET",
		params: objectKeysToSnakeCase(params),
	});
}

function updateInvitation(invitation_code, action) {
	return axios({
		url: `v1/admin/invitation`,
		method: "PUT",
		data: {
			invitation_code: invitation_code,
			action,
		},
	});
}

function decodeResetLink(code) {
	return axios({
		url: `v1/users/resetlink/status`,
		method: "GET",
		params: {
			reset_code: code,
			realm: "canarie",
		},
	});
}

function resetPassword(code, password) {
	return axios({
		url: `v1/users/password/set`,
		method: "POST",
		data: {
			reset_code: code,
			realm: "canarie",
			new_password: password,
		},
	});
}

function changePassword(data) {
	return axios({
		url: `v1/users/password/change`,
		method: "PUT",
		data: {
			...data,
			realm: "canarie",
		},
	});
}

function addPlatformGUID(projectId, userId, platform, platformUserGUID) {
	return axios({
		url: `v1/addforeignid/${projectId}`,
		method: "POST",
		params: {
			user_id: userId,
			platform: platform,
			platform_user_id: platformUserGUID,
		},
	});
}

function deletePlatformGUID(projectId, userId, platform, platformUserGUID) {
	return axios({
		url: `v1/addforeignid/${projectId}`,
		method: "DELETE",
		params: {
			user_id: userId,
			platform: platform,
			platform_user_id: platformUserGUID,
		},
	});
}

function authorizeFitbit(username) {
	return axios({
		url: `v1/fitbit/auth/${username}`,
	});
}

function pullFitbitData(label, username) {
	return axios({
		url: `v1/fitbit/data-points/${label}`,
		method: "POST",
		data: {
			username: username,
			normalize: false,
		},
	});
}

function updateFitbitStatus(userId, state, code, userName, authType) {
	return axios({
		url: `v1/user-status/${userId}`,
		method: "PUT",
		data: {
			state: state ? state : "",
			code: code ? code : "",
			username: userName,
			fitbit_status: authType,
		},
	});
}

export {
	inviteUser,
	getUserInformation,
	addUser,
	getUsers,
	checkUserInfo,
	suspendUsers,
	activateUsers,
	refreshTokenAPI,
	register,
	readToken,
	answerQuestion,
	changeRole,
	forgotPassword,
	getInvitaions,
	updateInvitation,
	decodeResetLink,
	resetPassword,
	changePassword,
	addPlatformGUID,
	deletePlatformGUID,
	authorizeFitbit,
	pullFitbitData,
	updateFitbitStatus,
};
