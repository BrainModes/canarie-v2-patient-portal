import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Card, Tabs, Layout, Button, message } from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';
import { Prompt } from 'react-router'

import styles from "./index.module.scss";
import LandingHeader from "../Landing/LandingHeader/LandingHeader";
import GeneralInfo from './Tabs/GeneralInfo';
import StudyConfig from './Tabs/StudyConfig';
import StudyAttributes from './Tabs/StudyAttributes';
import VendorIntegration from "./Tabs/VendorIntegration/VendorIntegration";

import { setAttributes, getPublicStudies, getContainers } from '../../../APIs';
import {
	setPublicStudies,
	setAllStudies,
	setAttrOrder,
} from "../../../Redux/actions";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Content } = Layout;

function Config(props) {
	const [editMode, setEditMode] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const { studyAttributes, studies } = useSelector((state) => state);
	const { t } = useTranslation(['message']);
	const [datasetInfo, setDatasetInfo] = useState(props.currentStudy);
	const [userListOnDataset, setUserListOnDataset] = useState(null);
	const [activateKey, setActivateKey] = useState('general_info');
	const [datasetUpdate, setDatasetUpdate] = useState(props.currentStudy);
	const [emailValid, setEmailValid] = useState({ 'primaryEmail': true, 'investigatorEmail': true })

	const dispatch = useDispatch();

	useEffect(() => {
		setDatasetInfo(props.currentStudy);
		setDatasetUpdate(props.currentStudy);
	}, [props.currentStudy]);

	const saveDatasetInfo = async () => {
		if (!emailValid.primaryEmail) {
			message.error(t('message:config.general.primaryEmail.valid'));
			return;
		}

		if (!emailValid.investigatorEmail) {
			message.error(t('message:config.general.investigatorEmail.valid'));
			return;
		}

		setIsSaving(true);
		let project = { ...studies.currentStudy, ...datasetUpdate };
		project.attrs_order = studyAttributes.attrsOrder;
		delete project.time_lastmodified;
		const res = await setAttributes(project.id, project);

		if (res.status === 200) {
			setDatasetInfo(project);
		}

		setIsSaving(false);
		setEditMode(false);

		const res2 = await getPublicStudies();
		dispatch(setPublicStudies(res2.data.result));

		const res3 = await getContainers();
		const containers = res3?.data?.result?.node;
		const studiesArr = containers.filter((item) => {
			if (item.labels[0] === "study") return { item };
		});
		dispatch(setAllStudies(studiesArr));

		return;
	};

	function validateEmail(email) {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	const updateDatasetInfo = (field, value) => {
		if (field === 'name') {
			let isNameInvalid = value.length > 100;
			if (isNameInvalid) {
				message.error(t('message:config.general.name.valid'));
				return
			}
		}
		
		if (field === 'primaryEmail') {
			const isValid = validateEmail(value);
			if (!isValid) {
				setEmailValid({ ...emailValid, primaryEmail: false });
				return
			}
			else {
				setEmailValid({ ...emailValid, primaryEmail: true });
			}
		}

		if (field === 'investigatorEmail') {
			const isValid = validateEmail(value);
			if (!isValid) {
				setEmailValid({ ...emailValid, investigatorEmail: false });
				return
			} else {
				setEmailValid({ ...emailValid, investigatorEmail: true });
			}
		}

		setDatasetUpdate({ ...datasetUpdate, [field]: value });
	};

	const handleBtnCancel = () => {
		const attrsOrderOrigin = props.currentStudy?.attrs_order
			? props.currentStudy?.attrs_order
			: props.mItem.attributes.map((attrItem) => "attr_" + attrItem.key);
		dispatch(setAttrOrder(attrsOrderOrigin));
		setEditMode(false);
	}

	const tabBarExtraContent = editMode ? (
		<>
			<Button
				loading={isSaving}
				onClick={saveDatasetInfo}
				style={{ marginRight: 10 }}
				className={styles.button}
				type="primary"
				icon={<SaveOutlined />}
			>
				Save
			</Button>
			<Button onClick={handleBtnCancel} type="link">
				Cancel
			</Button>
		</>
	) : (
		<Button
			style={{ color: "#595959" }}
			onClick={() => {
				setEditMode(true);
			}}
			type="link"
			icon={<EditOutlined />}
		>
			Edit
		</Button>
	);

	return (
		<>
			<LandingHeader />
			<Content className={"content"}>
				<Prompt
					when={editMode}
					message="You have unsaved changes, are you sure you want to leave?"
				/>
				<Card className={styles.card_wrapper} style={{ marginTop: 30 }}>
					<Tabs
						className={styles.custom_tabs}
						tabBarExtraContent={
							activateKey === "general_info" && tabBarExtraContent
						}
						renderTabBar={(props, DefaultTabBar) => {
							return (
								<DefaultTabBar
									className={styles.tabHeader}
									{...props}
									style={{ paddingLeft: 16 }}
								/>
							);
						}}
					>
						<TabPane tab="General Information" key="general_info">
							<div style={{ backgroundColor: "white" }}>
								<GeneralInfo
									userListOnDataset={userListOnDataset}
									updateDatasetInfo={updateDatasetInfo}
									saveDatasetInfo={saveDatasetInfo}
									editMode={editMode}
									datasetInfo={datasetInfo}
									setEditMode={setEditMode}
									datasetUpdate={datasetUpdate}
									setDatasetInfo={setDatasetInfo}
									emailValid={emailValid}
								/>
							</div>
						</TabPane>

						<TabPane tab="Study Configuration" key="study_config">
							<div style={{ backgroundColor: "white" }}>
								<StudyConfig
									{...props}
									editMode={editMode}
									setEditMode={setEditMode}
									datasetInfo={datasetInfo}
									updateDatasetInfo={updateDatasetInfo}
									saveDatasetInfo={saveDatasetInfo}
									datasetUpdate={datasetUpdate}
								/>
							</div>
						</TabPane>

						<TabPane tab="Study Attributes" key="study_attributes">
							<div style={{ backgroundColor: "white" }}>
								<StudyAttributes
									currentStudy={props.currentStudy}
									configEditMode={editMode}
								/>
							</div>
						</TabPane>

						<TabPane
							tab="Vendor Integration"
							key="Vendor Integration"
						>
							<div style={{ backgroundColor: "white" }}>
								<VendorIntegration
									{...props}
									editMode={editMode}
									setEditMode={setEditMode}
									datasetInfo={datasetInfo}
									updateDatasetInfo={updateDatasetInfo}
									saveDatasetInfo={saveDatasetInfo}
									datasetUpdate={datasetUpdate}
								/>
							</div>
						</TabPane>
					</Tabs>
				</Card>
			</Content>
		</>
	);
}

export default Config;
