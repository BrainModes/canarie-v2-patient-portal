import React, { Component } from "react";
import IdleTimer from "react-idle-timer";
import { Switch, Route } from "react-router-dom";
import { withCookies, useCookies } from "react-cookie";
import { appRoutes as routes } from "./Routes";
import "./App.scss";

import RefreshModal from "./Components/Modals/RefreshModal";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { userAuthManager } from "./Service/userAuthManager";
import { tokenManager } from "./Service/tokenManager";

import { message } from "antd";
import { connect } from "react-redux";

import {
	getContainers,
	checkUserInfo,
	getPublicStudies,
	updateFitbitStatus,
} from "./APIs";
import {
	setAllStudies,
	setCurrentUser,
	setPublicStudies,
} from "./Redux/actions";
import { parse_query_string } from "./Utility";

message.config({
	maxCount: 2,
});

class App extends Component {
	constructor(props) {
		super(props);
		this.idleTimer = null;
		this.handleOnAction = this.handleOnAction.bind(this);
		this.handleOnActive = this.handleOnActive.bind(this);
		this.handleOnIdle = this.handleOnIdle.bind(this);
	}

	componentDidMount() {
		userAuthManager.init();
		const { cookies } = this.props.cookies;

		this.props.isLogin &&
			getContainers().then((res) => {
				const containers = res?.data?.result?.node;
				const studiesArr = containers.filter((item) => {
					if (item.labels[0] === "study") return { item };
				});
				this.props.setAllStudies(studiesArr);
			});

		this.props.isLogin &&
			checkUserInfo({ username: cookies.username }).then((res) => {
				if (res.status === 200) {
					this.props.setCurrentUser(res.data.result);
				}
			});

		this.props.isLogin &&
			getPublicStudies().then((res) => {
				if (res.status === 200) {
					this.props.setPublicStudies(res.data.result);
				}
			});
		const queryString = window.location.href.split("?")[1];
		if (
			this.props.isLogin &&
			queryString &&
			queryString.includes("state") &&
			this.props.user.role !== "patient"
		) {
			const params = parse_query_string(queryString);
			const state = params.state;
			const code = params.code;

			let fitbitData = localStorage.getItem("fitbitData");
			fitbitData = JSON.parse(fitbitData);
			const currentFitbitData = fitbitData.find((el) =>
				state.includes(el.state),
			);

			if (this.props.isLogin) {
				updateFitbitStatus(
					currentFitbitData.userId,
					currentFitbitData.state,
					code,
					currentFitbitData.name,
					"authorized",
				).then((res) => {
					if (res.status === 200) {
						message.success(
							`${currentFitbitData.name} has been successfully authorized on Fitbit.`,
						);
						window.location.href = `/study/${currentFitbitData.id}/patients`;
					}
				});
			}
		}
	}

	handleOnAction(event) {
		if (this.props.isLogin) {
			const remainTime = tokenManager.getTokenTimeRemain();
			// console.log('user did something', remainTime)

			if (remainTime < 100) {
				userAuthManager.extendAuth();
			}
		}
	}

	handleOnActive(event) {
		console.log("user is active", event);
		console.log("time remaining", this.idleTimer.getRemainingTime());
	}

	handleOnIdle(event) {
		console.log("user is idle", event);
		console.log("last active", this.idleTimer.getLastActiveTime());
	}

	render() {
		return (
			<>
				<IdleTimer
					ref={(ref) => {
						this.idleTimer = ref;
					}}
					timeout={1000 * 60 * 15}
					onActive={this.handleOnActive}
					onIdle={this.handleOnIdle}
					onAction={this.handleOnAction}
					debounce={250}
				/>
				<div>
					<Switch>
						{routes.map((item) =>
							item.protected ? (
								<ProtectedRoute
									path={item.path}
									key={item.path}
									exact={item.exact || false}
									component={item.component}
								/>
							) : (
								<Route
									path={item.path}
									key={item.path}
									exact={item.exact || false}
									component={item.component}
								/>
							),
						)}
					</Switch>
					<RefreshModal />
				</div>
			</>
		);
	}
}

export default connect(
	(state) => ({ isLogin: state.isLogin, user: state.user }),
	{
		setAllStudies,
		setCurrentUser,
		setPublicStudies,
	},
)(withCookies(App));

// trigger cicd
