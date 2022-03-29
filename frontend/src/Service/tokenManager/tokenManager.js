import { Cookies } from "react-cookie";
import { serverAxios } from "../../APIs/config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
class TokenManager {
	cookies;
	setTimeId;
	listeners;
	constructor() {
		this.cookies = new Cookies();
		this.listeners = [];
		let domainArr;
		if (window.location.hostname !== "localhost") {
			domainArr = window.location.hostname.split(".");
			domainArr[0] = "";
		} else {
			domainArr = ["localhost"];
		}
		this.cookieDomain = domainArr.join(".");
		setInterval(() => {
			// console.log(
			// 	"token time remained " + this.getTokenTimeRemain() + "s",
			// );
			this._traverseListeners();
			// console.log(this.listeners);
		}, 1000);
	}

	/**
	 * get a cookie
	 * @param {string} name the name of cookie
	 * @returns {string|undefined} the cookie value
	 */
	getCookie(name) {
		if (typeof name !== "string") {
			throw new Error(`the name argument should be a string`);
		}
		return this.cookies.get(name);
	}
	/**
	 * set cookies
	 * @param {{access_token?:string,refresh_token?:string}} newCookies object of key:value
	 */
	setCookies(newCookies) {
		Object.keys(newCookies).forEach((key) => {
			this.cookies.set(key, newCookies[key], {
				path: "/",
				domain: this.cookieDomain,
			});
		});
	}

	/**
	 * refresh the token to the axios headers, by default read it from cookie
	 * @param {string?} accessToken the access token
	 */
	refreshToken(accessToken) {
		serverAxios.defaults.headers.common["Authorization"] = `Bearer ${
			accessToken || this.getCookie("access_token")
		}`;
		this._traverseListeners();
	}

	/**
	 * execute all listener functions in this.listener
	 */
	_traverseListeners() {
		const timeRemain = this.getTokenTimeRemain();
		this.listeners.forEach((item) => {
			const { time, func, condition, params } = item;
			if (condition(timeRemain, time)) {
				func(...params);
			}
		});
	}

	/**
	 * do func() when condition can return a true with ${time}
	 * @param {{time:number,func:(...params:T)=>void,condition?:(timeRemain:number,time:number)=>boolean,params?:T[]}} listener if condition is not specified, only return true when time === timeRemain
	 * @returns {string} the id to cancel the listener, by calling tokenManager.removeListener(listenerId)
	 */
	addListener(listener) {
		const listenerId = uuidv4();
		const {
			time,
			func,
			condition = (timeRemain, time) => timeRemain === time,
			params = [],
		} = listener;
		if (typeof time !== "number") {
			throw new Error("the time should be a number");
		}
		if (!_.isFunction(func)) {
			throw new Error("the listener.func should be a function");
		}
		if (condition && !_.isFunction(condition)) {
			throw new Error("the listener.condition should be a function");
		}
		if (params && !Array.isArray(params)) {
			throw new Error(
				`the params for func should be grouped into an array in order`,
			);
		}
		this.listeners.push({ time, func, condition, params, listenerId });
		return listenerId;
	}

	/**
	 * remove a listener function from the token timeline
	 * @param {string} listenerId the uuid of the listener function
	 */
	removeListener(listenerId) {
		if (typeof listenerId !== "string") {
			throw new Error("the listenerId should be an string");
		}
		_.remove(this.listeners, (item) => item.listenerId === listenerId);
	}

	/**
	 * token will expire in $return seconds
	 * @param {string?} token the access token
	 * @returns {number} if -1, token is not valid
	 */
	getTokenTimeRemain(token) {
		token = token || this.getCookie("access_token");
		if (!token) {
			return -1;
		} else {
			const exp = jwtDecode(token).exp;
			// console.log(`time remain: ${exp - moment().unix()}`)
			return exp - moment().unix();
		}
	}

	/**
	 * clear all cookies
	 */
	clearCookies() {
		console.log("TokenManager -> clearCookies -> clearCookies!!");
		Object.keys(this.cookies.getAll()).forEach((key) => {
			this.cookies.remove(key, {
				domain: this.cookieDomain,
			});
		});
	}

	/**
	 * if token still valid, return true;
	 * @returns {boolean}
	 */
	checkTokenUnExpiration() {
		const token = this.getCookie("access_token");
		if (token && this.getTokenTimeRemain(token) >= 0) {
			return true;
		} else {
			return false;
		}
	}
}

const tokenManager = new TokenManager();
export default tokenManager;
