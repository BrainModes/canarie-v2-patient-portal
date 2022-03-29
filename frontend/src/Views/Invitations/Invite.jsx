import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { Layout } from "antd";
import { invitationsRoutes as routes } from "../../Routes";
function Invite() {
	const match = useRouteMatch();

	return (
		<Layout style={{ minHeight: "100vh" }}>
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
		</Layout>
	);
}

export default Invite;
