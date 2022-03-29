import { combineReducers } from "redux";
import refreshTokenModal from "./refreshToken";
import isLogin from "./isLogin";
import studies from "./studies";
import user from './user';
import publicStudies from './publicStudies';
import redCapLinks from './redCapLinks';
import studyAttributes from './studyAttrs';

export default combineReducers({
	studies,
	refreshTokenModal,
	isLogin,
	user,
	publicStudies,
	redCapLinks,
	studyAttributes,
});
