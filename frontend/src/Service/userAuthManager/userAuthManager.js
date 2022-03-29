import {
	userLogoutCreator,
	setRefreshModal,
	setUploadListCreator,
	setIsLoginCreator,
	setUsernameCreator,
} from "../../Redux/actions";
import { store } from "../../Redux/store";
// import { q } from "../../Context";

import { tokenManager } from "../tokenManager";
import { reduxActionWrapper, resetReduxState } from "../../Utility";
// import { broadcastManager } from "../broadcastManager";
import { namespace } from "../namespace";
import { refreshTokenAPI } from "../../APIs";
import { namespace as serviceNamespace } from "../namespace";
import { history } from "../../Routes";

const [setRefreshModalDispatcher, setIsLoginDispatcher] = reduxActionWrapper([
	setRefreshModal,
	setIsLoginCreator,
]);
const modalTime = 60;
class UserAuthManager {
	openRefreshModalId;
	closeRefreshModalId;
	expirationId;
	/**
	 * init refresh modal listener, broadcast listener, token expiration, autoRefreshMonitor to monitor the uploading process.
	 * @returns {boolean} if the token is valid or not
	 */
	init() {
		// this.listenToBroadcast();
		if (tokenManager.getCookie("isLogin") !== "true") {
			return;
		} else {
			//set redux
			setIsLoginDispatcher(true);
			this.initRefreshModal();
			this.initExpirationLogout();
			tokenManager.refreshToken();
			this.autoRefreshMonitor();
		}
	}

	initRefreshModal() {
		const time = modalTime; // the time to show the refresh modal
		this.openRefreshModalId = tokenManager.addListener({
			time,
			func: () => {
				const { isLogin } = store.getState();
				if (isLogin) setRefreshModalDispatcher(true);
			},
			condition: (timeRemain, time) => {
				return (
					timeRemain < time && tokenManager.checkTokenUnExpiration()
				);
			},
		});
		// this.closeRefreshModalId = tokenManager.addListener({
		// 	time,
		// 	func: () => {
		// 		setRefreshModalDispatcher(false);
		// 	},
		// 	condition: (timeRemain, time) =>
		// 		timeRemain > time || !tokenManager.checkTokenUnExpiration(),
		// });
	}
	/**
	 * if remain time is 0, logout
	 */
	initExpirationLogout() {
		const time = 0;
		const condition = (timeRemain, time) => timeRemain < time;
		const func = () => {
			this.logout(namespace.userAuthLogout.TOKEN_EXPIRATION);
		};
		this.expirationId = tokenManager.addListener({ time, func, condition });
	}

	receivedLogout() {
		this.logout(namespace.userAuthLogout.RECEIVED_LOGOUT);
	}
	/**
	 * push to interval, if the time remained is less than 2 mins and the queue has upload task, auto refresh, and broadcast
	 */
	autoRefreshMonitor() {
		const time = modalTime + 1; //the time to auto refresh, should be modal time +1
		const func = () => {
			// const tasks = q.length() + q.running();
			// console.log(tasks, "tasks");
			// if (tasks !== 0) {
			const { username } = store.getState();
			// this.extendAuth().then((res) => {
			// 	broadcastManager.postMessage(
			// 		"refresh",
			// 		serviceNamespace.broadCast.AUTO_REFRESH,
			// 		username,
			// 	);
			// });
			// }
			const { isLogin } = store.getState();
			if (isLogin) setRefreshModalDispatcher(false);
		};
		const condition = (timeRemain, time) => {
			return tokenManager.checkTokenUnExpiration() && timeRemain > time;
		};
		tokenManager.addListener({ time, func, condition });
	}

	/**
	 * listen to broadcast login, logout, refresh
	 */
	// listenToBroadcast() {
	// 	broadcastManager.addListener("logout", (msg, channelNamespace) => {
	// 		this.logout(namespace.userAuthLogout.RECEIVED_LOGOUT);
	// 	});
	// 	broadcastManager.addListener("login", (msg, channelNamespace) => {
	// 		const { isLogin, username } = store.getState();
	// 		console.log(username, "username");
	// 		console.log(msg, "  msg");
	// 		if (!isLogin) {
	// 			return;
	// 		} else if (msg === username) {
	// 			tokenManager.refreshToken();
	// 			return;
	// 		} else {
	// 			this.logout(namespace.userAuthLogout.RECEIVED_LOGIN);
	// 		}
	// 	});
	// 	broadcastManager.addListener("refresh", (msg, channelNamespace) => {
	// 		const { isLogin, username } = store.getState();
	// 		if (!isLogin) {
	// 			return;
	// 		} else if (msg === username) {
	// 			tokenManager.refreshToken();
	// 			return;
	// 		}
	// 	});
	// }

	/**
	 * get a new access token and refresh token from the backend. extend the auth by refreshing the refresh_token and access_token from the backend. May be called when q is uploading files or user click on the refresh button on the modal
	 */
	async extendAuth() {
		const refreshTokenOld = tokenManager.getCookie("refresh_token");
		const res = await refreshTokenAPI({ refreshtoken: refreshTokenOld });
		const { access_token, refresh_token } = res.data.result;
		tokenManager.setCookies({
			access_token,
			refresh_token,
		});
		tokenManager.refreshToken(access_token);
		return;
	}

	//reset all redux to be implemented
	logout(namespace) {
		if (
			!Object.values(serviceNamespace.userAuthLogout).includes(namespace)
		) {
			throw new Error(
				`the namespace is not defined on userAuth namepace file`,
			);
		}
		console.log(namespace, "namespace of logout");
		// q.kill();
		tokenManager.clearCookies();
		resetReduxState();

		//Refresh page
		tokenManager.removeListener(this.expirationId);
		// history.go(0);
		window.location.href = "/";
	}
}

const userAuthManager = new UserAuthManager();
export default userAuthManager;
