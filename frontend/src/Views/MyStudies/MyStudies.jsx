import React from "react";
import { StandardLayout } from "../../Components/Layout";
import { withRouter } from "react-router-dom";
import { useCookies } from "react-cookie";

import MyStudiesContentPublic from "./MyStudiesContent/MyStudiesContentPublic";
import MyStudiesContent from "./MyStudiesContent/MyStudiesContent";
function Studies(props) {
	// const {
	// 	match: { path, params },
	// } = props;
	const config = {
		observationVars: [],
		initFunc: () => {},
	};
	const [cookies] = useCookies();
	const { isLogin } = cookies;
	return (
		<StandardLayout {...config}>
			{isLogin ? <MyStudiesContent /> : <MyStudiesContentPublic />}
		</StandardLayout>
	);
}

export default withRouter(Studies);
