import React from "react";
import { Result, Button, Layout } from "antd";
import { withRouter, Link } from "react-router-dom";
const { Content } = Layout;
function Error404(props) {
	return (
		<Content>
			<Result
				status="403"
				title="403"
				subTitle="Sorry, you are not authorized to access this page."
				extra={
					<Button type="primary">
						<Link to="/">Back Home</Link>
					</Button>
				}
			/>
		</Content>
	);
}

export default withRouter(Error404);
