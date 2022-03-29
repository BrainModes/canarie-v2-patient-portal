import React, { useEffect } from "react";
import { Form, Row, Col, Card, Layout, message, Typography, Spin } from "antd";
import CreateAccount from "../../Components/Form/CreateAccount";
import Question from "./Question";
import {
	readToken,
	register,
	answerQuestion as answerQuestionAPI,
} from "../../APIs";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Content } = Layout;
const { Title } = Typography;

function Invitations(props) {
	const [form] = Form.useForm();
	const [isLoading, setIsLoading] = React.useState(true);
	const [isRegistered, setRegistered] = React.useState(null);
	const [question, setQuestion] = React.useState(null);
	const [email, setEmail] = React.useState("");
	const [username, setUsername] = React.useState("");
	const [error, setError] = React.useState(null);
	const [projectId, setProjectId] = React.useState(null);
	const { t, i18n } = useTranslation(["message"]);

	useEffect(() => {
		const { invitationHash } = props.match.params;
		readToken(invitationHash).then(
			(res) => {
				if (res.status === 200) {
					setRegistered(res.data.result.is_Registered);
					setQuestion(res.data.result.question);
					setUsername(res.data.result.username);
					setEmail(res.data.result.email);
					setProjectId(res.data.result.projectId);
					setIsLoading(false);
				} else {
					setError("Invitation not found.");
					setIsLoading(false);
				}
			},
			(x) => {
				setError("Invitation not found");
				setIsLoading(false);
			},
		);
	}, [username]);

	const registerAccount = (values) => {
		register(values)
			.then((res) => {
				if (res.status === 200) {
					setRegistered(true);
					setUsername(values.username);
					message.success(t("message:users.register.success"));
				} else {
					message.error(t("message:users.register.failed"));
				}
			})
			.catch((err) => {
				if (err.response) {
					const { result } = err.response.data;
					message.error(result);
				}
			});
	};

	if (isLoading) {
		return <Spin />;
	}

	if (error) {
		return (
			<Layout>
				<Content>
					<Row
						justify="center"
						align="middle"
						style={{ minHeight: "80vh" }}
					>
						<Col>
							<Card
								style={{ textAlign: "center", padding: "10px" }}
							>
								<Title level={3}>Invitation not found</Title>
								<p>Please contact your study coordinator.</p>
							</Card>
						</Col>
					</Row>
				</Content>
			</Layout>
		);
	}

	return (
		<Layout>
			<Content>
				<Card
					style={{
						textAlign: "center",
						padding: "10px",
						maxWidth: 700,
						margin: "50px auto",
					}}
				>
					<Title level={3}>
						You have been invited to enroll in a study on Patient
						Portal.
					</Title>
					<p>Upon completion of the forms you will be enrolled.</p>

					{isRegistered === false ? (
						<div>
							<CreateAccount
								onSubmit={registerAccount}
								email={email}
							/>
						</div>
					) : null}
					{isRegistered === true ? (
						<Question
							projectId={projectId}
							username={username}
							question={question}
						/>
					) : null}
				</Card>
			</Content>
		</Layout>
	);
}

const InviteContent = withRouter(Invitations);

export { InviteContent };
