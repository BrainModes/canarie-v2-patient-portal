import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import {
	Radio,
	Modal,
	Button,
	Space,
	Select,
	Switch,
	Input,
	Form,
	message,
} from "antd";
import styles from "../index.module.scss";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getRedCapToken, updateRedCapToken } from "../../../../APIs";
import { updateCurrentStudy } from "../../../../Redux/actions";

const { Option } = Select;
const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 },
};

function StudyConfig(props) {
	const [form] = Form.useForm();

	const [consentNameEditable, setConsentNameEditable] = useState(false);
	const [emailNameEditable, setEmailNameEditable] = useState(false);
	const [modelVisible, setModalVisible] = useState(false);
	const [redCapToken, setRedCapToken] = useState(null);
	const { datasetUpdate, updateDatasetInfo } = props;
	const { t } = useTranslation(["message"]);
	const dispatch = useDispatch();

	useEffect(() => {
		getRedCapToken(props.currentStudy.id).then((res) => {
			const { result } = res.data;
			setRedCapToken(result.redap_token);
		});
	}, [props.currentStudy.id]);

	const onCancel = () => {
		setModalVisible(false);
		form.resetFields();
	};

	const onSubmit = () => {
		const token = form.getFieldValue("token");
		if (!token)
			message.error(t("message:config.settings.apiToken.required"));

		updateRedCapToken(props.currentStudy.id, token).then((res) => {
			if (res.status === 200) {
				setRedCapToken(token);
				updateDatasetInfo("redap_token", token);
				setModalVisible(false);
				form.resetFields();
				message.success(t("message:config.settings.redCap.success"));
			}
		});
	};

	return (
		<div style={{ padding: 20 }}>
			<div style={{ float: "left", width: "749px", marginLeft: 6 }}>
				<div
					style={{
						display: "inline-block",
					}}
				>
					<b style={{ fontSize: 15 }}>Status</b>
					<p style={{ marginLeft: 20, marginTop: 10, fontSize: 15 }}>
						<Radio.Group
							onChange={(e) => {
								props.updateDatasetInfo(
									"status",
									e.target.value,
								);
							}}
							value={datasetUpdate.status}
							disabled={!props.editMode}
						>
							<Space direction="vertical">
								<Radio value="dev">
									<b>Development</b>
								</Radio>
								<p style={{ marginLeft: 30, fontSize: 12 }}>
									All Patient Data Gateway containers are
									created in Development mode where Container
									Admin are able to setup the study and test
									features with mock data.
								</p>
								<Radio value="prod">
									<b>Production</b>
								</Radio>
								<p style={{ marginLeft: 30, fontSize: 12 }}>
									Move the container into Production when you
									have chosen an Enrollment Workflow and are
									ready to begin data collection.
								</p>
								<Radio value="closed">
									<b>Closed</b>
								</Radio>
								<p style={{ marginLeft: 30, fontSize: 12 }}>
									When you are finished with the container,
									change the status to Closed. All access by
									Researcher Members and Patients will be
									suspended and Container Admin access will be
									read-only.
								</p>
							</Space>
						</Radio.Group>
					</p>
					{/* <b style={{ fontSize: 15, marginTop: 15 }}>
						Study Splash Page
					</b>
					<p style={{ marginLeft: 30, marginTop: 10 }}>
						<Switch
							defaultChecked={
								props.datasetInfo &&
								props.datasetInfo.discoverable
							}
							disabled={!props.editMode}
							checkedChildren="on"
							unCheckedChildren="off"
							onChange={(checked, e) =>
								props.updateDatasetInfo("discoverable", checked)
							}
						/>
						<b style={{ fontSize: 14, marginLeft: 10 }}>
							Public Visibility:
							{datasetUpdate.discoverable ? "ON" : "OFF"}
						</b>
						<p style={{ marginLeft: 54 }}>
							{datasetUpdate.discoverable
								? "All site visitors are able to access the page and view the contents."
								: "Site visitors are unable to access the page and view the contents. Only study members and participants will be able to view the page."}
						</p>
					</p> */}

					<b style={{ fontSize: 15, marginTop: 15 }}>
						REDCap Project Setup
					</b>
					<p style={{ marginLeft: 30, marginTop: 10 }}>
						<b style={{ fontSize: 14, marginLeft: 10 }}>
							API Token
						</b>
						<p>
							<Input
								className={styles.input}
								disabled
								type="password"
								value={redCapToken}
							/>
							<Button
								style={{
									marginLeft: 10,
									borderRadius: 15,
									border: "1px solid",
								}}
								onClick={() => setModalVisible(true)}
								disabled={!props.editMode}
							>
								Replace Token
							</Button>
						</p>

						<p style={{ fontSize: 14, marginTop: 25 }}>
							<Switch
								defaultChecked={
									props.datasetInfo &&
									props.datasetInfo.useEconsent
								}
								disabled={!props.editMode}
								checkedChildren="on"
								unCheckedChildren="off"
								onChange={(checked, e) =>
									props.updateDatasetInfo(
										"useEconsent",
										checked,
									)
								}
							/>
							<b style={{ fontSize: 14, marginLeft: 10 }}>
								Study uses eConsent:
								{datasetUpdate.useEconsent ? "ON" : "OFF"}
							</b>
							<p style={{ marginLeft: 54 }}>
								{datasetUpdate.useEconsent
									? "The study is connected with REDCap eConsent survey."
									: "The study is not connected with REDCap eConsent survey."}
							</p>
						</p>
					</p>
				</div>
			</div>
			<Modal
				visible={modelVisible}
				title="REDCap Project Setup"
				onCancel={onCancel}
				footer={[
					<Button key="back" onClick={onCancel} type="danger">
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={onSubmit}>
						Submit
					</Button>,
				]}
				width={550}
			>
				<Form
					form={form}
					{...layout}
					initialValues={{ oldToken: redCapToken }}
				>
					<Form.Item label="Old API Token" name="oldToken">
						<Input disabled />
					</Form.Item>

					<Form.Item
						label="API Token"
						name="token"
						rules={[
							{
								required: true,
								message: "Please input API Token!",
							},
						]}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

export default withRouter(StudyConfig);
