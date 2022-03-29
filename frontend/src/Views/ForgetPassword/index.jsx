import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { useRouteMatch } from "react-router-dom";

import StandardLayout from "../../Components/Layout/StandardLayout";
import { forgetPasswordRoutes as routes } from "../../Routes";
import ForgetPasswordForm from "../../Components/Form/ForgetPassword";
import { decodeResetLink } from "../../APIs";
import { set } from "lodash";

const { Content } = Layout;

function ForgetPassword(props) {
	const {
		match: { path, params },
		location: { pathname },
	} = props;
	const config = {
		observationVars: [],
		initFunc: () => {},
	};
	const pathArray = pathname.split("/");
	const hashCode = pathArray[pathArray.length - 1];
	return (
		<StandardLayout {...config}>
			<Content className={"content"}>
				<div style={{ maxWidth: "600px", margin: "30px auto" }}>
					<ForgetPasswordForm hashCode={hashCode} />
				</div>
			</Content>
		</StandardLayout>
	);
}

export default ForgetPassword;
