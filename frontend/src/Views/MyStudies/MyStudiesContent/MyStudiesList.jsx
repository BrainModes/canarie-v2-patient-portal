import React from "react";
import { List, Empty } from "antd";
import { useSelector } from "react-redux";
import styles from "./index.module.scss";
import StudyCard from "./StudyCard";

const MyStudiesList = (props) => {
	let allStudies = useSelector((state) => state.studies.allStudies);
	allStudies = allStudies
		.filter((a) => a.permission !== "None")
		.sort(function (a, b) {
			return (
				new Date(b.time_created).getTime() -
				new Date(a.time_created).getTime()
			);
		});
	return allStudies.length ? (
		<List
			id="uploadercontent_project_list"
			itemLayout="horizontal"
			size="large"
			dataSource={allStudies}
			pagination={{
				pageSize: 10,
			}}
			renderItem={(item) => <StudyCard studyItem={item} />}
		/>
	) : (
		<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
	);
};

export default MyStudiesList;
