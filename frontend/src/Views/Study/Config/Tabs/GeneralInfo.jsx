import React, { useEffect } from "react";
import _ from "lodash";
import {
	Form,
	Input,
	Switch,
	Tag,
	Select,
	Avatar,
	Upload,
	Typography,
	Button,
} from "antd";
import { lineBreaker } from "../../../../Utility";
import styles from "../index.module.scss";
import { withRouter } from "react-router-dom";
import ImgCrop from "antd-img-crop";
import moment from "moment";

const { TextArea } = Input;
const { Paragraph } = Typography;
function GeneralInfo(props) {
	const {
		match: {
			params: { datasetId },
		},
		editMode,
		userListOnDataset,
		updateDatasetInfo,
		datasetUpdate,
		datasetInfo,
		setDatasetInfo,
		emailValid,
	} = props;
	function getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener("load", () => callback(reader.result));
		reader.readAsDataURL(img);
	}
	async function beforeIconChange(file) {
		getBase64(file, async (imageUrl) => {
			const compressedIcon = await resizeImage(imageUrl);
			updateDatasetInfo("project_icon", compressedIcon);
		});
	}
	function imageToDataUri(img, width, height) {
		var canvas = document.createElement("canvas"),
			ctx = canvas.getContext("2d");
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(img, 0, 0, width, height);
		return canvas.toDataURL();
	}
	function resizeImage(originalDataUri) {
		return new Promise((resolve, reject) => {
			var img = new Image();
			img.onload = () => {
				var newDataUri = imageToDataUri(img, 200, 200);
				resolve(newDataUri);
			};
			img.src = originalDataUri;
		});
	}

	return datasetInfo ? (
		<div style={{ padding: 20 }}>
			<div
				id="setting-left"
				style={{ float: "left", width: "349px", marginLeft: 6 }}
			>
				<div
					style={{
						display: "inline-block",
					}}
				>
					{datasetUpdate.project_icon ? (
						<Avatar
							src={datasetUpdate.project_icon}
							size={65}
						></Avatar>
					) : (
						<Avatar
							style={{
								backgroundColor: "#13c2c2",
								verticalAlign: "middle",
							}}
							size={65}
						>
							<span
								style={{
									fontSize: 50,
									fontWeight: "bold",
									textTransform: "uppercase",
								}}
							>
								{datasetUpdate.name
									? datasetUpdate.name.charAt(0)
									: ""}
							</span>
						</Avatar>
					)}
				</div>

				<div
					style={{
						display: "inline-block",
						marginLeft: 26,
						verticalAlign: "middle",
					}}
				>
					<h4 className={styles.iconTitle}>
						Upload your project icon
					</h4>
					<p className={styles.iconP}>
						Recommended size is 200 x 200px
					</p>
					<ImgCrop shape="round">
						<Upload
							showUploadList={false}
							beforeUpload={beforeIconChange}
						>
							<Button
								className={styles.button}
								type="primary"
								disabled={!editMode}
							>
								Upload Icon
							</Button>
						</Upload>
					</ImgCrop>
				</div>
				<div
					style={{ width: 320, paddingRight: 10, marginTop: 38 }}
				></div>
			</div>
			<div id="setting-right" style={{ marginLeft: "349px" }}>
				<Form
					layout="vertical"
					style={{
						maxWidth: 700,
						marginLeft: 40,
						marginRight: 40,
					}}
					className={styles.custom_general_info_form}
				>
					<div style={{ display: "inline-block" }}>
						<Form.Item label="Project Name">
							{editMode ? (
								<Input
									style={{ width: 500 }}
									defaultValue={datasetInfo.name}
									onChange={(e) =>
										updateDatasetInfo(
											"name",
											_.trimStart(e.target.value),
										)
									}
								/>
							) : (
								<p
									style={{
										wordBreak: "break-all",
										width: "100%",
									}}
								>
									{datasetInfo.name}
								</p>
							)}
						</Form.Item>
					</div>

					<Form.Item label="Project Investigator">
						<Paragraph
							style={{
								color: "rgba(0,0,0,0.8)",
							}}
							ellipsis={{
								rows: 2,
								expandable: true,
							}}
						>
							{editMode ? (
								<Input
									style={{ width: 500 }}
									defaultValue={datasetInfo.investigator}
									onChange={(e) =>
										updateDatasetInfo(
											"investigator",
											_.trimStart(e.target.value),
										)
									}
								/>
							) : (
								<p
									style={{
										wordBreak: "break-all",
										width: "100%",
									}}
								>
									{datasetInfo.investigator}
								</p>
							)}
						</Paragraph>
					</Form.Item>

					<Form.Item label="Sponsors and Collaborators">
						{editMode ? (
							<Input
								style={{ width: 500 }}
								defaultValue={datasetInfo.sponsor}
								onChange={(e) =>
									updateDatasetInfo(
										"sponsor",
										_.trimStart(e.target.value),
									)
								}
							/>
						) : (
							<p
								style={{
									wordBreak: "break-all",
									width: "100%",
								}}
							>
								{datasetInfo.sponsor}
							</p>
						)}
					</Form.Item>

					<Form.Item label="Create Time">
						{datasetInfo.time_created
							? moment(datasetInfo.time_created).format(
									"YYYY-MM-DD HH:mm",
							  )
							: null}
					</Form.Item>

					<Form.Item label="Eligibility Criteria">
						{editMode ? (
							<div>
								<TextArea
									autoSize
									style={{ minHeight: 60 }}
									maxLength={150}
									defaultValue={datasetInfo.criteria}
									onChange={(e) =>
										updateDatasetInfo(
											"criteria",
											_.trimStart(e.target.value),
										)
									}
								/>
								<span style={{ float: "right" }}>{`${
									datasetUpdate.criteria
										? datasetUpdate.criteria.length
										: 0
								}/150`}</span>
							</div>
						) : (
							<p
								style={{
									wordBreak: "break-all",
									width: "100%",
								}}
							>
								{datasetInfo.criteria &&
									lineBreaker(datasetInfo.criteria)}
							</p>
						)}
					</Form.Item>

					<Form.Item label="Contact Information">
						{editMode ? (
							<div>
								<TextArea
									autoSize
									style={{ minHeight: 60 }}
									maxLength={100}
									defaultValue={datasetInfo.contact}
									onChange={(e) =>
										updateDatasetInfo(
											"contact",
											_.trimStart(e.target.value),
										)
									}
								/>
								<span style={{ float: "right" }}>{`${
									datasetUpdate.contact
										? datasetUpdate.contact.length
										: 0
								}/100`}</span>
							</div>
						) : (
							<p
								style={{
									wordBreak: "break-all",
									width: "100%",
								}}
							>
								{datasetInfo.contact &&
									lineBreaker(datasetInfo.contact)}
							</p>
						)}
					</Form.Item>

					<Form.Item label="Primary Study Email">
						{editMode ? (
							<div>
								<Input
									style={
										emailValid.primaryEmail
											? { width: 500 }
											: { width: 500, borderColor: "red" }
									}
									className={
										!emailValid.primaryEmail &&
										styles.antInput
									}
									defaultValue={datasetInfo.primaryEmail}
									onChange={(e) =>
										updateDatasetInfo(
											"primaryEmail",
											_.trimStart(e.target.value),
										)
									}
								/>
								{!emailValid.primaryEmail && (
									<p
										style={{
											color: "red",
											marginLeft: 5,
											marginTop: 5,
										}}
									>
										Email format is not correct
									</p>
								)}
							</div>
						) : (
							<a
								href={`mailto:${datasetInfo.primaryEmail}`}
								rel="noreferrer noopener"
								style={{
									paddingRight: "5px",
									wordBreak: "break-all",
								}}
							>
								{datasetInfo.primaryEmail}
							</a>
						)}
					</Form.Item>

					<Form.Item label="Principal Investigator Email Address">
						{editMode ? (
							<div>
								<Input
									style={
										emailValid.investigatorEmail
											? { width: 500 }
											: { width: 500, borderColor: "red" }
									}
									className={
										!emailValid.investigatorEmail &&
										styles.antInput
									}
									defaultValue={datasetInfo.investigatorEmail}
									onChange={(e) =>
										updateDatasetInfo(
											"investigatorEmail",
											_.trimStart(e.target.value),
										)
									}
								/>
								{!emailValid.investigatorEmail && (
									<p
										style={{
											color: "red",
											marginLeft: 5,
											marginTop: 5,
										}}
									>
										Email format is not correct
									</p>
								)}
							</div>
						) : (
							<a
								href={`mailto:${datasetInfo.investigatorEmail}`}
								rel="noreferrer noopener"
								style={{
									paddingRight: "5px",
									// color: '#595959',
									wordBreak: "break-all",
								}}
							>
								{datasetInfo.investigatorEmail}
							</a>
						)}
					</Form.Item>

					<Form.Item label="Description">
						{editMode ? (
							<div>
								<TextArea
									autoSize
									defaultValue={datasetInfo.description}
									onChange={(e) =>
										updateDatasetInfo(
											"description",
											e.target.value,
										)
									}
									style={{ minHeight: 100 }}
									maxLength={250}
								/>
								<span style={{ float: "right" }}>{`${
									datasetUpdate.description
										? datasetUpdate.description.length
										: 0
								}/250`}</span>
							</div>
						) : (
							<p style={{ wordBreak: "break-all" }}>
								{datasetInfo.description &&
									lineBreaker(datasetInfo.description)}
							</p>
						)}
					</Form.Item>
				</Form>
			</div>
		</div>
	) : null;
}
export default withRouter(GeneralInfo);
