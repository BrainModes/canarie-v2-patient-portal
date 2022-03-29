import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Layout, Typography, Row, Col, message } from "antd";

import styles from "./index.module.scss";
import CreateAccount from "../../../Components/Form/CreateAccount";

const { Content } = Layout;
const { Title } = Typography;

class StudiesContent extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}

	onSumit() {
		message.success("Registered!");
	}

	render() {
		return (
			<>
				<Content className={"content"}>
					<div className={styles.container}>
						<Row gutter={32}>
							<Col
								xs={{ span: 24 }}
								md={{ span: 11 }}
								style={{ marginBottom: "40px" }}
							>
								<Title level={2} style={{ marginTop: "40px" }}>
									Being involved in your health care improves the safety of your care and your medical outcomes. Join Patient Portal and get involved.
								</Title>
								<p>
									Please register on Patient Portal.
								</p>
								<p>
									Have and account?{" "}
									<Link
										to={{
											pathname: "/login",
											state: {
												prevPath:
													window.location.pathname,
											},
										}}
									>
										Log in
									</Link>{" "}
								</p>
								<img
									className={styles.imgContent}
									alt=""
									src={require("../../../Images/canarie-cover.jpeg")}
								/>
							</Col>
							<Col xs={{ span: 24 }} md={{ span: 13 }}>
								<CreateAccount />
							</Col>
						</Row>
					</div>
				</Content>
			</>
		);
	}
}
export default StudiesContent;
