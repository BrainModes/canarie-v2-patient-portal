import React from "react";
import { StandardLayout } from "../../Components/Layout";
import { errorPageRoutes as routes } from "../../Routes/index";
import { withRouter, Switch, Route } from "react-router-dom";

function ErrorPage(props) {
	const {
		match: { path },
	} = props;
	const config = {
		observationVars: [],
		initFunc: () => {},
	};
	return (
		<StandardLayout {...config}>
			<Switch>
				{routes.map((item) => (
					<Route
						exact={item.exact || false}
						path={path + item.path}
						key={item.path}
						render={() => <item.component />}
					></Route>
				))}
			</Switch>
		</StandardLayout>
	);
}

export default withRouter(ErrorPage);
