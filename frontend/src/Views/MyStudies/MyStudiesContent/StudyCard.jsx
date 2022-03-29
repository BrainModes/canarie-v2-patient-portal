import React from 'react';
import { Avatar, Tag } from 'antd';
import { DownCircleOutlined } from "@ant-design/icons";
import { Link } from 'react-router-dom';
import styles from './index.module.scss';

const StudyCard = (props) => {
    const { studyItem } = props;
    return (
		<div className={styles.study_card}>
			<div className={styles.study_img}>
				{studyItem && studyItem.project_icon ? (
					<Link to={`/study/${studyItem.id}/landing`}>
						<Avatar
							shape="circle"
							size={40}
							src={studyItem.project_icon}
						/>{" "}
					</Link>
				) : (
					<Link to={`/study/${studyItem.id}/landing`}>
						<Avatar
							shape="circle"
							size={40}
							src={require("../../../Images/study_cover.jpg")}
						/>
					</Link>
				)}
			</div>
			<div className={styles.study_info}>
				<Link to={`/study/${studyItem.id}/landing`}>
					<p className={styles.study_name}>
						{studyItem ? studyItem.name : ""}
					</p>
				</Link>
				<p className={styles.study_description}>
					{studyItem && studyItem.description}
				</p>
			</div>
			<div className={styles.study_tag}>
				<Tag color="green">Recruiting</Tag>
			</div>
		</div>
	);
};

export default StudyCard;
