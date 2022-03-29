import React, { useEffect, useState } from "react";
import { Layout, Typography } from "antd";
import { useSelector, useDispatch } from "react-redux";
import MyStudiesTabs from "./MyStudiesLTabs";
import styles from "./index.module.scss";

import { getContainers } from "../../../APIs";
import { setAllStudies } from "../../../Redux/actions";

const { Content } = Layout;
const { Title } = Typography;

function StudiesContent(props) {
	const dispatch = useDispatch();
	useEffect(() => {
		getContainers().then((res) => {
			const containers = res?.data?.result?.node;
			const studiesArr = containers.filter((item) => {
				if (item.labels[0] === "study") return { item };
			});
			dispatch(setAllStudies(studiesArr));
		});
	}, []);

	return (
		<>
			<Content className={"content"}>
				<div className={styles.container}>
					<MyStudiesTabs />
				</div>
			</Content>
		</>
	);
}
export default StudiesContent;
