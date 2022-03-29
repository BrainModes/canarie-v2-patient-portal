import React, { useState } from "react";
import {
	Typography,
	Table,
	Button,
	message,
	Modal,
	Upload,
	Progress,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import csv from "papaparse";
import _ from "lodash";
import { useTranslation } from 'react-i18next';
import { inviteUser, checkUserInfo } from "../../APIs";

const { Text } = Typography;
var Promise = require("bluebird");

function BulkInviteUsers({ closeBulkModal, visible }) {
	const [csvError, setCsvError] = useState(null);
	const [usersError, setUsersError] = useState([]);
	const [userList, setUserList] = useState(null);
	const [selectedUsers, setSelectedUsers] = useState(null);
	const [progress, setProgress] = useState(0); // 0-100
	const { t, i18n } = useTranslation(['message']);

	const bulkUserColumns = [
		{
			title: "Username",
			dataIndex: "username",
			key: "username",
		},
		{
			title: "First Name",
			dataIndex: "firstname",
			key: "firstname",
		},
		{
			title: "Last Name",
			dataIndex: "lastname",
			key: "lastname",
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Role",
			dataIndex: "role",
			key: "role",
		},
	];
	function onClose() {
		closeBulkModal();
		clearStatus();
	}

	function clearStatus() {
		setUserList(null);
		setCsvError(null);
		setSelectedUsers(null);
		setProgress(0);
		setUsersError([]);
	}
	const onBulkSubmit = async () => {
		console.log("selected:", selectedUsers);

		// for each selected user, run addOneUser()
		// when all promised are settled, based on whether exceptions are thrown, print
		// the right summary message

		setProgress(0);
		const step = (1 / selectedUsers.length) * 100;
		let progressPercentage = 0;

		const promises = selectedUsers.map((user) => addOneUser(user));

		Promise.allSettled(promises).then((res) => {
			let hasProblem = false;
			res.forEach((result) => {
				if (result._settledValueField instanceof Error) {
					hasProblem = true;
				}
			});
			if (hasProblem) {
				message.info(t('message:invitation.bulk_invite.problem'));
			} else {
				// onClose();
				setProgress(100);
				message.success(t('message:invitation.bulk_invite.success'));
			}
		});

		/**
		 * Check username and email of this user. If both valid,
		 * this user will be invited.
		 * Otherwise, exception will be thrown and error will be added to to usersError state.
		 *
		 * @param {*} user
		 * @returns
		 */
		function addOneUser(user) {
			return new Promise((resolve, reject) => {
				const checkUsername = validateUser(
					{ field: "username" },
					user.username,
				);

				checkUsername
					.then(() => console.log("name is ok"))
					.then(() => {
						return validateUser({ field: "email" }, user.email);
					})
					.then(() => console.log("email is ok"))
					.then(() => {
						return inviteUser(
							Object.assign({}, user, { projectId: -1 }),
						);
					})
					.then(() => {
						progressPercentage += step;
						setProgress(progressPercentage);
						resolve("userAdded!");
					})
					.catch((error) => {
						setUsersError([...usersError, error.message]);
						console.log(error.message);
						reject(new Error(error.message));
					});
			});
		}
	};

	/**
	 * Validate user with username or email
	 *
	 * @param {*} rule the
	 * @param {*} value
	 */
	const validateUser = (rule, value) => {
		return new Promise((resolve, reject) => {
			const query = {};
			query[rule.field] = value;
			const userInfo = checkUserInfo(query);
			userInfo
				.then((result) => {
					console.log("validateUser -> result", result);
					if (!_.isEmpty(result.data.result)) {
						reject(new Error(`${rule.field} ${value} is taken`));
					}
					const res = { message: "the user info is valid" };
					resolve(res);
				})
				.catch((err) => {
					console.log("validateUser -> err", err);
					reject(new Error(err));
				});
		});
	};

	const props = {
		name: "file",
		beforeUpload: (file) => {
			clearStatus();
			// Check file type.
			// on windows, the csv file will be read as application/vnd.ms-excel,
			// https://christianwood.net/csv-file-upload-validation/
			if (
				file.type === "text/csv" ||
				file.type === "application/vnd.ms-excel"
			) {
				//Parse csv with papa parser
				csv.parse(file, {
					header: true,
					skipEmptyLines: true,
					complete: function (results) {
						// Check first item, if not exist, throw error
						if (!results.data[0]) {
							setCsvError(
								"Cannot read items in uploaded file, please use the template or check format.",
							);
							return;
						}

						// Check header format, has to have following fields
						const header = Object.keys(results.data[0]);
						const requiredCols = [
							"username",
							"firstname",
							"lastname",
							"email",
							"role",
						];
						for (const item of requiredCols) {
							if (!header.includes(item)) {
								setCsvError(
									'csv header has to include following fields: "username","firstname","lastname","email", "role"',
								);
								return false;
							}
						}

						//Update userlist
						setUserList(results.data);
						setSelectedUsers(results.data);
					},
					error: function (error) {
						console.error("error: ", error);
					},
				});
				return false;
			} else {
				setCsvError("You can only upload csv file.");
				setUserList(null);
				return false;
			}
		},
		showUploadList: false,
		headers: {
			authorization: "authorization-text",
		},
		onChange(info) {
			if (info.file.status !== "uploading") {
				// console.log(info.file, info.fileList);
			}
			if (info.file.status === "done") {
				message.success(`${info.file.name} ${t('message:invitation.bulk_invite.file.success')}`);
			} else if (info.file.status === "error") {
				message.error(`${info.file.name} ${t('message:invitation.bulk_invite.file.failed')}`);
			}
		},
	};
	const rowSelection = {
		onChange: (selectedRowKeys, selectedRows) => {
			console.log(
				`selectedRowKeys: ${selectedRowKeys}`,
				"selectedRows: ",
				selectedRows,
			);
			setSelectedUsers(selectedRows);
		},
		getCheckboxProps: (record) => ({
			disabled: record.name === "Disabled User", // Column configuration not to be checked
			name: record.name,
		}),
		selectedRowKeys:
			selectedUsers && selectedUsers.map((user) => user.email),
	};

	return (
		<Modal
			title="Bulk Add Users"
			visible={visible}
			onOk={onBulkSubmit}
			onCancel={onClose}
			width={800}
			footer={[
				<Button key="cancel" onClick={onClose}>
					Cancel
				</Button>,
				<Button
					key="submit"
					type="primary"
					disabled={
						!(selectedUsers && selectedUsers.length > 0) || csvError
					}
					onClick={onBulkSubmit}
				>
					Submit
				</Button>,
			]}
		>
			<p>
				You can use{" "}
				<a href="/files/users-template.csv" download target="_self">
					this template
				</a>{" "}
				to create the csv for bulk adding users.
			</p>
			<p>Select a csv file which contains user details.</p>

			<Upload {...props}>
				<Button
					style={{
						marginBottom: "15px",
					}}
				>
					<UploadOutlined /> Click to Upload
				</Button>
			</Upload>
			{csvError && (
				<p>
					<Text type="danger">{csvError}</Text>
				</p>
			)}
			{usersError &&
				usersError.map((e, i) => (
					<p key={`error-${i}`}>
						<Text type="danger">{e}</Text>
					</p>
				))}
			{userList && (
				<Table
					rowSelection={{
						type: "checkbox",
						...rowSelection,
					}}
					dataSource={userList}
					columns={bulkUserColumns}
					rowKey={(record) => record.email}
					footer={() =>
						`${
							selectedUsers ? selectedUsers.length : 0
						} users are selected`
					}
				/>
			)}
			{progress > 0 && (
				<Progress
					strokeColor={
						usersError.length > 0
							? null
							: {
									from: "#108ee9",
									to: "#87d068",
							  }
					}
					percent={progress}
					status={usersError.length > 0 ? "exception" : "active"}
				/>
			)}
		</Modal>
	);
}

export default BulkInviteUsers;
