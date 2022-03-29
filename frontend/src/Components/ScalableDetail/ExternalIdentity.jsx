import React, { useEffect, useState } from "react";
import { Table, Space, Modal, message, Divider } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
	authorizeFitbit,
	pullFitbitData,
	updateFitbitStatus,
} from "../../APIs";
import { useSelector } from "react-redux";
import { parse_query_string } from "../../Utility";

function ExternalIdentityManagement(props) {
	const { record, studyId } = props;
	const studies = useSelector(
		(state) => state.studies && state.studies.allStudies,
	);
	const currentStudy = studies.find((el) => el.id === Number(studyId));
	const handleAuthorize = async () => {
		const response = await authorizeFitbit(record.name);
		let authorizeUrl = null;

		if (response.status === 200) {
			authorizeUrl = response.data.result.authorizationUrl;
		} else {
			message.error(
				"Network error when trying to authorize user in fitbit.",
			);
			return;
		}

		const queryString = authorizeUrl.split("?")[1];
		const baseUrl = authorizeUrl.split("?")[0];
		const params = parse_query_string(queryString);

		if (params.redirect_uri) delete params.redirect_uri;

		let fitbitData = localStorage.getItem("fitbitData") || [];

		if (fitbitData.length) fitbitData = JSON.parse(fitbitData);

		const userFitbitData = fitbitData.find(
			(el) => el.state === params.state,
		);
		if (!userFitbitData) {
			fitbitData.push({
				id: currentStudy.id,
				state: params.state,
				name: record.name,
				userId: record.id,
			});
		}

		localStorage.setItem("fitbitData", JSON.stringify(fitbitData));
		let newQueryString = "";
		for (let key in params) {
			if (newQueryString.length) {
				newQueryString = newQueryString + "&" + `${key}=${params[key]}`;
			} else {
				newQueryString = newQueryString + `${key}=${params[key]}`;
			}
		}
		const newAuthUrl = `${baseUrl}?${newQueryString}`;
		window.location.assign(newAuthUrl);
		//window.open(newAuthUrl);
	};

	function confirm(platform) {
		Modal.confirm({
			title: "Confirm",
			icon: <ExclamationCircleOutlined />,
			content: `To authorize a wearable device for user ${record.name} we will need to redirect you to a third-party site`,
			onOk: handleAuthorize,
		});
	}

	const pullData = async () => {
		const stepCountRes = await pullFitbitData("step_count", record.name);
		const sleepDurationRes = await pullFitbitData(
			"sleep_duration",
			record.name,
		);
		const physicalActivityRes = await pullFitbitData(
			"physical_activity",
			record.name,
		);

		message.success(
			`Successfully pull patient ${record.name} data from fitbit`,
		);
	};

	const handleUnauthorized = async () => {
		try {
			await updateFitbitStatus(
				record.id,
				null,
				null,
				record.name,
				"unauthorized",
			);
			message.success('Successfully unauthorized the patient, please refresh the page!');
		} catch(error) {
			message.error(
				"Failed to unauthorized the patient, please try again later!",
			);
			console.log(error);
		}
	}

	const columns = [
		{
			title: "Platform",
			dataIndex: "platform",
			key: "platform",
		},
		{
			title: "Platform ID",
			dataIndex: "platformId",
			key: "platformId",
			render: (text, item) => {
				if (record.fitbit_status === "authorized") {
					return "Account connected";
				} else {
					return <span style={{ color: "red" }}>{text}</span>;
				}
			},
		},
		{
			title: "Actions",
			key: "action",
			render: (text, item) => {
					if (record.fitbit_status === "authorized") {
						return (
							<Space size="small">
								<a onClick={() => handleUnauthorized()}>
									Unauthorize
								</a>
								<Divider type="vertical" />
								<a onClick={() => pullData()}>Pull Data</a>
							</Space>
						);
					} else {
						return (
							<Space size="middle">
								<a onClick={() => confirm(item.platform)}>
									Authorize
								</a>
							</Space>
						);
					}
			},
		},
	];

	const thirdParty = currentStudy?.thirdParty;

	const dataSource = [];

	if (thirdParty) {
		for (const item of thirdParty) {
			dataSource.push({
				platform: item,
				platformId: "No account connected",
				key: item,
			});
		}
	}

	return (
		<div style={{ paddingBottom: "6px", overflow: "auto" }}>
			<Table columns={columns} dataSource={dataSource} />
		</div>
	);
}

export default ExternalIdentityManagement;
