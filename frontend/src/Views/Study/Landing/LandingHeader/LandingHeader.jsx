import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import moment from 'moment';
import styles from './LandingHeader.module.scss';
import { Avatar, Tag } from "antd";
import { ArrowLeftOutlined, ClockCircleOutlined } from "@ant-design/icons";

const LandingHeader = (props) => {
	const [currentTime, setCurrentTime] = useState(
		moment().format("llll").split(",")
	);
	const currentStudy = useSelector((state) => state.studies.currentStudy);
	const currentTimeDisplay = () => {
		setCurrentTime(moment().format("llll").split(","));
	}

	useEffect(() => {
		const intervalSetting = setInterval(() => {
			currentTimeDisplay();
		}, 60000);
		return function cleanup() {
			clearInterval(intervalSetting);
		};
	}, []);

	const displayCurrentTime = () => {
		if (currentTime.length) {
			return (
				<div className={styles.current_time}>
					<div className={styles.icon_section}>
						<ClockCircleOutlined />
					</div>
					<div className={styles.time_section}>
						<p className={styles.date}>{currentTime[0]}</p>
						<p className={styles.time}>{`${
							currentTime[1]
						} / ${currentTime[2].substr(5)}`}</p>
					</div>
				</div>
			);
		} else {
			return null;
		}
	}

	return (
		<div className={styles.landing_header}>
			<div className={styles.back_arrow}>
				<Link to="/my-studies">
					<ArrowLeftOutlined />
				</Link>
			</div>
			<div className={styles.study_img}>
				{currentStudy && currentStudy.project_icon ? (
					<Avatar
						shape="circle"
						size={40}
						src={currentStudy.project_icon}
					/>
				) : (
					<Avatar
						shape="circle"
						size={40}
						src={require("../../../../Images/study_cover.jpg")}
					></Avatar>
				)}
			</div>
			<div className={styles.study_info}>
				<p className={styles.study_name}>
					{currentStudy ? currentStudy.name : ""}
				</p>
				<p className={styles.study_description}>
					{currentStudy && currentStudy.description}
				</p>
			</div>
			<div className={styles.study_tag}>
				<Tag color="green">Recruiting</Tag>
			</div>
			{displayCurrentTime()}
		</div>
	);
};;

export default LandingHeader;