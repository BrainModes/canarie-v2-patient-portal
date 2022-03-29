import React, { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useSelector } from 'react-redux';
import { getResearcherApplicable } from '../../APIs';

const StudyResearcherPageRoleMap = {
	"admin": [
		'/study/:studyId/researchers', 
		'/study/:studyId/patients', 
		'/study/:studyId/landing', 
		'/study/:studyId/config',
		'/study/:studyId',
	],
	"member": [
		'/study/:studyId/patients', 
		'/study/:studyId/landing', 
		'/study/:studyId',
	],
	"patient": [
		'/study/:studyId/landing', 
		'/study/:studyId',
	],
};

const ProtectedRoute = ({ component: Component, ...rest }) => {
	const [cookies] = useCookies(["isLogin"]);
	const [access, setAccess] = useState(true);
	const user = useSelector(state => state.user);

	const platformRole = cookies.role;

	const pathname = rest.location.pathname;
	const pathArr = pathname.split('/');
	const studyId = pathname.includes('study') && pathArr[pathArr.length - 2];

	useEffect(() => {
		(studyId && studyId !== 'undefined' && user.role !== 'patient') && getResearcherApplicable(studyId)
			.then((res) => {
				const username = cookies.username;
				if (res.status === 200) {
					const { result } = res.data;

					const user = result.find(item => item.username === username);

					const path = rest.path;

					if (platformRole === 'patient') {
						if (!StudyResearcherPageRoleMap[platformRole].includes(path)) setAccess(false);;
						return;
					} else if (platformRole !== 'instance-admin' && !StudyResearcherPageRoleMap[user['permission']].includes(path)) {
						setAccess(false);
					}
				}
			})
			.catch((err) => {
				setAccess(false);
			});
	}, [])

	return (
		<Route
			{...rest}  
			render={(props) => {
				if (cookies.isLogin && access) {
					return <Component {...rest} {...props} />;
				} else {
					return (
						<Redirect
							to={{
								pathname: "/error/403",
								state: {
									from: props.location,
								},
							}}
						/>
					);
				}
			}}
		/>
	);
};

export default ProtectedRoute;
