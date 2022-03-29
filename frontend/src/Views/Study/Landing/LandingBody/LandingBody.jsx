import React from "react";
import { useSelector } from "react-redux";
import { Card, Tag, Empty } from "antd";
import { lineBreaker } from "../../../../Utility";
import styles from "./LandingBody.module.scss";

const LandingBody = (props) => {
	const currentStudy = props.currentStudy;
	const user = useSelector((state) => state.user);
	const studyDescriptions = [];
	if (currentStudy) {
		const keys = currentStudy.attrs_order
			? currentStudy.attrs_order
			: Object.keys(currentStudy);

		for (const key of keys) {
			if (key.startsWith("attr")) {
				const value = currentStudy[key];
				if (value) {
					let displayValue = value;
					if (typeof value !== "string") {
						displayValue = value.map((el) => (
							<Tag style={{ marginBottom: "5px" }}>{el}</Tag>
						));
					}
					studyDescriptions.push(
						<div>
							<h3>{key.slice(5).replace("_", " ")}</h3>
							<p>{displayValue}</p>
						</div>,
					);
				}
			}
		}
	}
	return (
		<div className={styles.landing_body}>
			{user.role && user.role !== "patient" ? (
				<Card className={styles.card_one} title={"Study Details"}>
					{/* <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> */}
					<iframe
						src="https://spotfire.indocresearch.org/spotfire/wp/Embed?file=/CANARIE/CANARIE_Project_Dashboard_DRAFT&configurationBlock=SetPage%28pageIndex%3D0%29%3B&options=7-0,8-0,9-0,10-0,11-0,12-0,13-0,14-0,1-0,2-0,3-0,4-0,5-0,6-0,15-0,17-0"
						title="spotfire iframe"
					></iframe>
				</Card>
			) : null}

			<Card className={styles.card_two} title="Study Description">
				<div className={styles.card_contents}>
					<div>
						<h3>Contact Information</h3>
						<p>
							{currentStudy && currentStudy.contact
								? lineBreaker(currentStudy.contact)
								: "No Data"}
						</p>
					</div>
					<div>
						<h3>Project Investigator</h3>
						<p>
							{currentStudy && currentStudy.investigator
								? currentStudy.investigator
								: "No Data"}
						</p>
					</div>
					<div>
						<h3>Sponsors and Collaborators</h3>
						<p>
							{currentStudy && currentStudy.sponsor
								? currentStudy.sponsor
								: "No Data"}
						</p>
					</div>
					{studyDescriptions.map((el) => el)}
				</div>
			</Card>
		</div>
	);
};

export default LandingBody;
