import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
	Typography,
	Card,
	Table,
	Tabs,
	Space,
	Button,
	Menu,
	Dropdown,
	message,
	Spin,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import moment from "moment-timezone";
import { InvitePatientModal } from "../../../Components/Modals/InvitePatientModal";
import InvitationTable from "../../../Components/Table/InvitationTable";
import { withRouter } from "react-router-dom";
import LandingHeader from "../Landing/LandingHeader/LandingHeader";
import AppFooter from "../../../Components/Layout/Footer";
import styles from "./index.module.scss";
import { getPatients, getSurveysCompeleteStatus } from "../../../APIs";
import { useParams } from "react-router-dom";
import ScalableDetails from "../../../Components/ScalableDetail/ScalableDetails";
const { Title } = Typography;
const { TabPane } = Tabs;

function Landing(props) {
	let { studyId } = useParams();
	const [users, setUsers] = React.useState([]);
	const [sidePanel, setSidePanel] = useState(false);
	const [currentRecord, setCurrentRecord] = useState(null);
	const [panelWidth, setPanelWidth] = useState(350);
	const [tableWidth, setTableWidth] = useState("70%");
	const [surveyCompleteStatus, setSurveyCompleteStatus] = useState([]);
	const [loading, setLoading] = useState(true);
	const studies = useSelector((state) => state.studies.allStudies);

	const myRef = useRef(null);

	useEffect(() => {
		if (props.currentStudy) getUsers();
	}, [props.currentStudy]);

	const getUsers = async () => {
		try {
			let surveyStatus = [];
			if (props.currentStudy && props.currentStudy.redap_token) {
				const surveyRes = await getSurveysCompeleteStatus(studyId);
				if (surveyRes.status === 200) {
					surveyStatus = surveyRes.data.result;
				}
			}

			const userRes = await getPatients(studyId);
			if (userRes.status === 200) {
				const data = userRes.data.result.map((item) => {
					if (item.container_guid_container) {
						const guidIndex = item.container_guid_container.indexOf(
							`${studyId}`,
						);
						const currentContainerGuid =
							item.container_guid_guid[guidIndex];

						const surveyInfo = surveyStatus.find(
							(survey) =>
								survey.record_id === currentContainerGuid,
						);

						if (surveyInfo && surveyInfo.uncompleted_surveys) {
							return {
								...item,
								key: item.id,
								isSurveyComplete: false,
								isSurveyStarted:
									surveyInfo["is_survey_started"],
								uncompletedSurveys:
									surveyInfo.uncompleted_surveys,
							};
						}
					}

					return {
						...item,
						key: item.id,
						isSurveyComplete: false,
						isSurveyStarted: false,
					};
				});
				setUsers(data);
				setLoading(false);
			}
		} catch (error) {
			if (
				error.response &&
				error.response.config.url === "/v1/user-survey/status"
			) {
				message.error(
					`${error.response.data.result}, please update the REDCap token in config page.`,
				);
			}
			setLoading(false);
		}
	};

	const columns = [
		{
			title: "Username",
			dataIndex: "username",
			key: "username",
			sorter: (a, b) => a.username.localeCompare(b.username),
		},
		{
			title: "Study Identifier",
			dataIndex: "guid",
			render: (text, record) => {
				const guidContainers = record.container_guid_container;
				const guidArray = record.container_guid_guid;

				if (guidContainers && guidArray) {
					const index = guidContainers.indexOf(String(studyId));

					return guidArray[index];
				}

				return "8SDFJH";
			},
		},
		{
			title: "First Name",
			dataIndex: "firstname",
			key: "firstName",
			sorter: (a, b) => a.firstname.localeCompare(b.firstname),
		},
		{
			title: "Last Name",
			dataIndex: "lastname",
			key: "lastName",
			sorter: (a, b) => a.lastname.localeCompare(b.lastname),
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Join Date",
			dataIndex: "time_created",
			key: "createdTimestamp",
			sorter: (a, b) => {
				return new Date(a.created_time) - new Date(b.created_time);
			},
			render: (text) => {
				return moment(text).format("YYYY-MM-DD HH:mm:ss");
			},
		},
		{
			title: "Enrolled",
			dataIndex: "isSurveyStarted",
			render: (text) => {
				if (text) return "Yes";
				return "No";
			},
		},
		{
			title: "Actions",
			key: "action",
			render: (text, record) => {
				const menu = (
					<Menu>
						<Menu.Item
							onClick={() => {
								setSidePanel(true);
								setCurrentRecord(record);
							}}
						>
							View
						</Menu.Item>
					</Menu>
				);

				return (
					<Dropdown overlay={menu} placement="bottomRight">
						<Button shape="circle">
							<MoreOutlined />
						</Button>
					</Dropdown>
				);
			},
		},
	];

	function callback(key) {
		console.log(key);
	}

	const toggleSidePanel = () => {
		setSidePanel(!sidePanel);
	};

	const mouseMove = (e) => {
		const mouseX = e.clientX;
		const parentX = myRef.current.getClientRects()[0].x;
		const parentWidth = myRef.current.getClientRects()[0].width;
		const delta = mouseX - parentX; //delta is the current table width
		const maxPanelwidth = 600;
		const panelWidth =
			parentWidth - delta > maxPanelwidth
				? maxPanelwidth
				: parentWidth - delta;
		const tableWidth = parentWidth - panelWidth;

		setTableWidth(tableWidth);
		setPanelWidth(panelWidth);
	};

	const stopMove = () => {
		document.removeEventListener("mousemove", mouseMove, true);
		document.removeEventListener("mouseup", stopMove, true);
	};

	const mouseDown = (e) => {
		document.addEventListener("mousemove", mouseMove, true);
		document.addEventListener("mouseup", stopMove, true);
	};

	return (
		<>
			<LandingHeader />
			<div className={styles.container}>
				{/* <Breadcrumb itemRender={itemRender} routes={routes} /> */}
				<div>
					<Title level={2}>Patients</Title>{" "}
				</div>
				<Card style={{ boxShadow: "0px 1px 9px #00000020" }}>
					<InvitePatientModal />
					<Spin spinning={loading}>
						<Tabs>
							<TabPane tab="Enrolled" key="enrolled">
								<div
									ref={myRef}
									style={{ display: sidePanel ? "flex" : "" }}
								>
									<div
										style={{
											borderRight:
												sidePanel &&
												"1px solid rgb(240, 240, 240)",
											marginRight: sidePanel && "16px",
											width: sidePanel && tableWidth,
										}}
									>
										<Table
											dataSource={users}
											columns={columns}
											style={{ marginTop: 20 }}
										/>
									</div>
									{sidePanel && (
										<ScalableDetails
											close={() => {
												toggleSidePanel();
												setCurrentRecord(null);
											}}
											width={panelWidth}
											record={currentRecord}
											mouseDown={mouseDown}
											location="CONTAINER PATIENT"
											studyId={studyId}
										/>
									)}
								</div>
							</TabPane>

							<TabPane tab="Invited" key="invited">
								<InvitationTable projectId={studyId} />
							</TabPane>
						</Tabs>
					</Spin>
				</Card>
			</div>
			<AppFooter />
		</>
	);
}

export default withRouter(Landing);
