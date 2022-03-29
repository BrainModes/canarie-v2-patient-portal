import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Input, message } from "antd";
import { inviteUser, getRedCapToken } from "../../APIs";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function InvitePatientModal() {
	const [visible, setVisible] = React.useState(false);
	const [form] = Form.useForm();
	const { t, i18n } = useTranslation(["message"]);
	let { studyId } = useParams();
	const [redcapConfigured, setRedcapConfigured] = useState(false);
	useEffect(() => {
		getRedCapToken(studyId).then((res) => {
			const { result } = res.data;
			if (result.redap_token) {
				setRedcapConfigured(true);
			}
		});
	}, []);
	return (
		<>
			<Button type="primary" onClick={() => setVisible(true)}>
				Invite Patient
			</Button>
			{/* {redcapConfigured ? (
				<Button type="primary" onClick={() => setVisible(true)}>
				Invite Patient
			</Button>
			) : (
				<Button type="primary" disabled>
					Invite Patient
				</Button>
			)} */}

			<Modal
				title="Invite Patient"
				visible={visible}
				okText="Invite"
				onOk={() => {
					form.validateFields()
						.then((values) => {
							const data = {
								...values,
								role: "patient",
								projectId: studyId,
							};
							inviteUser(data).then((res) => {
								if (res.status === 200) {
									message.success(
										t("message:invitation.patient.success"),
									);
								}
							});
							form.resetFields();
							setVisible(false);
						})
						.catch((info) => {
							console.log("Validate Failed:", info);
							message.error(
								t("message:invitation.patient.failed"),
							);
						});
				}}
				onCancel={() => setVisible(false)}
			>
				<Form form={form} layout="vertical" name="invite_patient">
					<Form.Item
						name="email"
						label="E-mail"
						rules={[
							{
								type: "email",
								message: t(
									"message:invitation.patient.email.valid",
								),
							},
							{
								required: true,
								message: t(
									"message:invitation.patient.email.required",
								),
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="question"
						label="Question"
						rules={[
							{
								required: true,
								message: t(
									"message:invitation.patient.question.required",
								),
							},
						]}
						hasFeedback
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="answer"
						label="Answer"
						rules={[
							{
								required: true,
								message: t(
									"message:invitation.patient.answer.required",
								),
							},
						]}
						hasFeedback
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="confirmAnswer"
						label="Confirm Answer"
						dependencies={["answer"]}
						hasFeedback
						rules={[
							{
								required: true,
								message: t(
									"message:invitation.patient.confirmAnswer.required",
								),
							},
							({ getFieldValue }) => ({
								validator(rule, value) {
									if (
										!value ||
										getFieldValue("answer") === value
									) {
										return Promise.resolve();
									}
									return Promise.reject(
										t(
											"message:invitation.patient.confirmAnswer.valid",
										),
									);
								},
							}),
						]}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}

export { InvitePatientModal };
