import React, { useEffect, useState } from "react";
import { Descriptions, Table, Popover } from "antd";
import PlatformTable from "./PlatformTable";
import { checkUserInfo, checkRedCapSurvey } from "../../APIs";
import { useSelector } from "react-redux";

function UserDetails(props) {
	const { record, location, studyId } = props;
	const { allStudies } = useSelector((state) => state.studies);
	const [userForeignPlatforms, setUserForeignPlatforms] = useState([]);
	const [userProjects, setUserProjects] = useState([]);
	const [userPlaformGuid, setUserPlatformGuid] = useState(null);
	const [enrolled, setErolled] = useState(false);

	useEffect(() => {
		checkUserInfo({ username: record.username }).then((res) => {
			if (res.status === 200) {
				const { result } = res.data;
				setUserPlatformGuid(result.guid);
				if (result.foreign_guid_platform) {
					const platforms = [];

					for (
						let i = 0;
						i < result.foreign_guid_platform.length;
						i++
					) {
						platforms.push({
							platform: result.foreign_guid_platform[i],
							platformId: result.foreign_guid_guid[i],
							key: String(i),
						});
					}
					setUserForeignPlatforms(platforms);
				}

				if (result.container_guid_container) {
					const projects = [];

					for (
						let i = 0;
						i < result.container_guid_container.length;
						i++
					) {
						const project = allStudies.find(
							(el) =>
								el.id ===
								Number(result.container_guid_container[i]),
						);
						projects.push({
							containerGuid: result.container_guid_guid[i],
							container: project.name,
							key: String(i),
							status: "Enrolled",
						});
					}
					setUserProjects(projects);
				}
			}
		});

		const container_guid_guid = record.container_guid_guid;
		const container_guid_container = record.container_guid_container;
		const index =
			container_guid_container &&
			container_guid_container.indexOf(String(studyId));
		const recordId = container_guid_guid && container_guid_guid[index];
	}, [record]);

	const columns = [
		{
			title: "Container",
			dataIndex: "container",
			key: "container",
		},
		{
			title: "Container GUID",
			dataIndex: "containerGuid",
			key: "containerGuid",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
		},
	];

	const columns2 = [
		{
			title: "Platform",
			dataIndex: "platform",
			key: "platform",
		},
		{
			title: "Platform ID",
			dataIndex: "platformId",
			key: "platformId",
		},
	];

	const surveysDetails = (
		<div>
			<p>
				<b>
					Complete Econsent: {record.isSurveyStarted ? "Yes" : "No"}
				</b>
			</p>
			{record.isSurveyStarted && record.uncompletedSurveys ? (
				<div>
					<h4>Uncomplete surveys:</h4>
					<ul>
						{record.uncompletedSurveys.map((el) => (
							<li>{el}</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);

	return (
		<div style={{ paddingBottom: "6px", overflow: "auto" }}>
			{!location ? (
				<Descriptions size="small" column={1}>
					<Descriptions.Item label={<b>User Name</b>}>
						{record.username}
					</Descriptions.Item>
					<Descriptions.Item label={<b>Status</b>}>
						{record.enabled ? "Active" : "Disabled"}
					</Descriptions.Item>
					{userPlaformGuid ? (
						<Descriptions.Item label={<b>Platform GUID</b>}>
							{userPlaformGuid}
						</Descriptions.Item>
					) : null}
				</Descriptions>
			) : (
				<Descriptions size="small" column={1}>
					<Descriptions.Item label={<b>User Name</b>}>
						{record.username}
					</Descriptions.Item>
					<Descriptions.Item label={<b>Container GUID</b>}>
						{record.container_guid_guid
							? record.container_guid_guid[0]
							: "-"}
					</Descriptions.Item>
					<Descriptions.Item label={<b>Status</b>}>
						{record.enabled ? "Enrolled" : "Disabled"}
					</Descriptions.Item>
					<Descriptions.Item label={<b>eConsent Enrolled</b>}>
						{record.isSurveyStarted ? "Yes" : "No"}
						<a style={{ marginLeft: 10 }}>
							<Popover
								title="Surveys Detail"
								content={surveysDetails}
							>
								View Detail
							</Popover>
						</a>
					</Descriptions.Item>
				</Descriptions>
			)}

			{!location ? (
				<Table
					style={{ marginTop: 20 }}
					columns={columns}
					dataSource={userProjects}
				/>
			) : (
				<PlatformTable
					columns={columns2}
					dataSource={userForeignPlatforms}
					studyId={props.studyId}
					userId={record.id}
				/>
			)}
		</div>
	);
}

export default UserDetails;
