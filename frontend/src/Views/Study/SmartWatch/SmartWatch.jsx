import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, Button } from "antd";
import LandingHeader from "../Landing/LandingHeader/LandingHeader";
import moment from "moment-timezone";
import { getWareHouseDataAPI } from "../../../APIs/index";
import { Line } from "@ant-design/charts";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import styles from "./SmartWatch.module.scss";

const SmartWatch = (props) => {
	const [data, setData] = useState([]);
	const username = useSelector((state) => state.user.username);
	useEffect(() => {
		if (username) {
			getWareHouseData();
		}
	}, [username]);

	const getWareHouseData = async () => {
		const res = await getWareHouseDataAPI(username);
		if (res.data.result.length) {
			const wareHouseData = res.data.result.map((el) => {
				return {
					Date: moment(el.date).format("YYYY-MM-DD"),
					Steps: el.value,
				};
			});
			setData(wareHouseData);
		}
	};

	const config = {
		data: data,
		padding: "auto",
		xField: "Date",
		yField: "Steps",
		xAxis: { tickCount: 5 },
	};
	return (
		<>
			<LandingHeader />
			<div className={styles.smart_watch}>
				<Card className={styles.card} title={<p>Your Daily Steps</p>}>
					<Line {...config} />
					{/* <div className={styles.btn_section}>
					<Button icon={<LeftOutlined />}>Previous Week</Button>
					<Button icon={<RightOutlined />}>Next Week</Button>
				</div> */}
				</Card>
			</div>
		</>
	);
};

export default SmartWatch;
