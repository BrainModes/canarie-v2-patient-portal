import React from "react";
import { Layout } from "antd";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import StandardLayout from "../../Components/Layout/StandardLayout";
import { registrationRoutes as routes } from "../../Routes";

const { Content } = Layout;

function Registration(props) {
	// const {
	// 	match: { path, params },
	// } = props;
	const config = {
		observationVars: [],
		initFunc: () => {},
	};
	const match = useRouteMatch();
	console.log(routes);
	return (
		<StandardLayout {...config}>
			<Content className={"content"}>
				<Switch>
					{routes.map((item) => (
						<Route
							exact={item.exact || false}
							path={match.url + item.path}
							key={item.path}
							render={(props) => <item.component />}
						></Route>
					))}
				</Switch>
			</Content>
		</StandardLayout>
	);
}

export default Registration;
