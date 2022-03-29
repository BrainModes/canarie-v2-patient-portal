import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { StandardLayout } from "../../Components/Layout";
import ProtectedRoute from '../../Components/ProtectedRoute/ProtectedRoute';
import { studyRoutes as routes } from "../../Routes/index";
import { withRouter, Switch, Route, useLocation } from "react-router-dom";
import { setSurveyLink, setSurveyQueueLink, setSurveyStatus, setCurrentStudy } from "../../Redux/actions";
import { checkRedCapSurvey, getRedCapSurveyQueueLink, getRedCapSurveyLink } from "../../APIs";

import StudyMenu from "./Menu/Menu";
import StudyBreadCrumb from "./Menu/BreadCrumbs";
import { Layout } from "antd";
const { Content } = Layout;
function Study(props) {
	const {
		match: { path, params },
		redirect,
	} = props;
	const config = {
		observationVars: [params.datasetId],
		initFunc: () => { },
	};
	const [cookies] = useCookies();
	const studies = useSelector((state) => state.studies && state.studies.allStudies);
	const user = useSelector((state) => state.user);
	const publicStudies = useSelector((state) => state.publicStudies);
	const [isSurveyStarted, setIsSurveyStarted] = useState(false);
	const [isSurveyConnected, setSurveyConnected] = useState(false);
	const [completedSurveyNum, setCompletedSurveyNum] = useState(0);
	const dispatch = useDispatch();
	const location = useLocation();

	const studyId = props.match.params.studyId;

	let isPublicView = false;
	let currentStudy = studies && studies.find((item) => item.id === Number(studyId));
	dispatch(setCurrentStudy(currentStudy));

	useEffect(() => {	
		if (currentStudy) {
			if (user && Object.keys(user).length && user.role === 'patient') {
				const container_guid_guid = user.container_guid_guid;
				const container_guid_container = user.container_guid_container;
	
				const index = container_guid_container && container_guid_container.indexOf(String(currentStudy.id));
	
				const recordId = container_guid_guid && container_guid_guid[index];
				
				recordId && checkRedCapSurvey(recordId, String(currentStudy.id))
					.then((res) => {
						if (res.status === 200) {
							if (res.data.result && res.data.result.length > 0) {
								setSurveyConnected(true);
								const eConsentData = res.data.result[0];
								if (eConsentData['econsent'] === '1') {
									setIsSurveyStarted(true);
									dispatch(setSurveyStatus(true));

									const keys = Object.keys(eConsentData);
									let num = 0;
									for (const key of keys) {
										if (key.includes('_complete') && eConsentData[key] === '2') num++;
									}
									setCompletedSurveyNum(num);
								}
								
								getRedCapSurveyLink(recordId, String(currentStudy.id))
									.then((res2) => {
										if (res2.status === 200) {
											dispatch(setSurveyLink(res2.data.result))
										}
									})
							}
						}
					});
				
				recordId && getRedCapSurveyQueueLink(recordId, String(currentStudy.id))
					.then((res) => {
						if (res.status === 200) {
							dispatch(setSurveyQueueLink(res.data.result))
						}
					})
				
			}
		}
	}, [user, currentStudy, location])

	if (!currentStudy) {
		currentStudy = publicStudies && publicStudies.find((item) => item.id === Number(studyId));

		if (currentStudy) isPublicView = true;
	}

	const routePaths = props.location.pathname
		.split("/")
		.filter((el) => el != "");

	const pathList = ['My Studies', currentStudy && currentStudy.name, routePaths[routePaths.length - 1]]

	return (
		<StandardLayout
			{...config}
			leftContent={
				<StudyMenu 
					currentStudy={currentStudy} 
					currentPath={routePaths.length && routePaths[2]} 
					isPublicView={isPublicView} 
					isSurveyConnected={isSurveyConnected}
				/>
			}
		>
			<Content style={{ marginLeft: 80 }}>
				<Switch>
					{routes.map((item) => {
						if (item.protected) {
							return (
								<ProtectedRoute
									exact={item.exact || false}
									path={path + item.path}
									key={item.path}
									component={item.component}
									datasetId={item.datasetId}
									currentStudy={currentStudy}
									isSurveyStarted={isSurveyStarted}
									isSurveyConnected={isSurveyConnected}
								/>
							)
						}

						return (
							<Route
								exact={item.exact || false}
								path={path + item.path}
								key={item.path}
								render={() => (
									<item.component 
										datasetId={item.datasetId} 
										currentStudy={currentStudy} 
										isSurveyStarted={isSurveyStarted} 
										isSurveyConnected={isSurveyConnected}
										completedSurveyNum={completedSurveyNum}
									/>
								)}
							/>
						)
					})}
				</Switch>
			</Content>
		</StandardLayout>
	);
}

export default withRouter(Study);
