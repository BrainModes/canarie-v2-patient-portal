import React from "react";
import { StandardLayout } from "../../Components/Layout";
import { withRouter } from "react-router-dom";
import StudiesContent from "./StudiesContent/StudiesContent";

function Studies(props) {
	// const {
	// 	match: { path, params },
	// } = props;
	const config = {
		observationVars: [],
		initFunc: () => {
			// getContainers().then((res) => {
			// 	const containers = res?.data?.result?.node;
			// 	dispatch(setAllStudies(containers));
			// });
		},
	};
	return (
		<StandardLayout {...config}>
			<StudiesContent />
		</StandardLayout>
	);
}

export default withRouter(Studies);
