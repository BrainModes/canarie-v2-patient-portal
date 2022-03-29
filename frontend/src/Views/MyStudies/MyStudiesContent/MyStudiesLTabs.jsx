import React from "react";
import { Tabs } from "antd";
import MyStudiesList from "./MyStudiesList";
import styles from "./index.module.scss";

const { TabPane } = Tabs;

const MyStudiesTabs = (props) => {
	return (
		<div className={styles.my_studies_tabs}>
			<Tabs
				className={styles.tab}
				defaultActiveKey="My Studies"
			>
				<TabPane tab="My Studies" key="My Studies">
					<MyStudiesList />
				</TabPane>
			</Tabs>
		</div>
	);
};

export default MyStudiesTabs;
